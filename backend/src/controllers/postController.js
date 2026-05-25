const slugify = require('slugify');
const { pool } = require('../config/database');

const makeSlug = (title) =>
  slugify(title, { lower: true, strict: true }) + '-' + Date.now().toString(36);

const calcReadingTime = (content) =>
  Math.max(1, Math.round(content.replace(/<[^>]+>/g, '').split(/\s+/).length / 200));

exports.getPosts = async (req, res) => {
  const { page = 1, limit = 10, category, tag, author, search, status = 'published' } = req.query;
  const offset = (page - 1) * limit;
  try {
    let where = ['p.status = ?'];
    let params = [status];
    if (category) { where.push('c.slug = ?'); params.push(category); }
    if (author)   { where.push('u.username = ?'); params.push(author); }
    if (search)   { where.push('(p.title LIKE ? OR p.excerpt LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
    let tagJoin = '';
    if (tag) {
      tagJoin = 'JOIN post_tags pt ON p.id = pt.post_id JOIN tags t ON pt.tag_id = t.id';
      where.push('t.slug = ?'); params.push(tag);
    }
    const countSql = `SELECT COUNT(DISTINCT p.id) as total FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      ${tagJoin} ${whereClause}`;
    const [countRows] = await pool.execute(countSql, params);
    const total = countRows[0].total;
    const sql = `SELECT DISTINCT p.id, p.title, p.slug, p.excerpt, p.cover_image,
        p.status, p.views, p.reading_time, p.created_at, p.published_at,
        u.id as author_id, u.username as author_username,
        u.full_name as author_name, u.avatar_url as author_avatar,
        c.id as category_id, c.name as category_name, c.slug as category_slug,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) as likes_count,
        (SELECT COUNT(*) FROM comments cm WHERE cm.post_id = p.id) as comments_count
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      ${tagJoin} ${whereClause}
      ORDER BY p.published_at DESC, p.created_at DESC
      LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));
    const [posts] = await pool.execute(sql, params);
    for (const post of posts) {
      const [tags] = await pool.execute(
        `SELECT t.name, t.slug FROM tags t JOIN post_tags pt ON t.id = pt.tag_id WHERE pt.post_id = ?`,
        [post.id]
      );
      post.tags = tags;
    }
    res.json({ posts, total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getPost = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT p.*, u.username as author_username, u.full_name as author_name,
        u.avatar_url as author_avatar, u.bio as author_bio,
        c.name as category_name, c.slug as category_slug,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) as likes_count,
        (SELECT COUNT(*) FROM comments cm WHERE cm.post_id = p.id) as comments_count,
        (SELECT COUNT(*) FROM bookmarks b WHERE b.post_id = p.id) as bookmarks_count
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = ?`, [req.params.slug]);
    if (!rows.length) return res.status(404).json({ error: 'Post not found' });
    const post = rows[0];
    if (post.status !== 'published' && req.user?.id !== post.author_id && req.user?.role !== 'admin')
      return res.status(403).json({ error: 'Access denied' });
    await pool.execute('UPDATE posts SET views = views + 1 WHERE id = ?', [post.id]);
    post.views += 1;
    const [tags] = await pool.execute(
      `SELECT t.name, t.slug FROM tags t JOIN post_tags pt ON t.id = pt.tag_id WHERE pt.post_id = ?`,
      [post.id]
    );
    post.tags = tags;
    if (req.user) {
      const [liked] = await pool.execute('SELECT 1 FROM likes WHERE user_id=? AND post_id=?', [req.user.id, post.id]);
      const [bookmarked] = await pool.execute('SELECT 1 FROM bookmarks WHERE user_id=? AND post_id=?', [req.user.id, post.id]);
      post.liked_by_user = liked.length > 0;
      post.bookmarked_by_user = bookmarked.length > 0;
    }
    res.json({ post });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createPost = async (req, res) => {
  const { title, content, excerpt, cover_image, category_id, status, tags } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Title and content required' });
  try {
    const slug = makeSlug(title);
    const reading_time = calcReadingTime(content);
    const published_at = status === 'published' ? new Date() : null;
    const [result] = await pool.execute(
      `INSERT INTO posts (title, slug, excerpt, content, cover_image, author_id, category_id, status, reading_time, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, slug, excerpt || null, content, cover_image || null, req.user.id, category_id || null, status || 'draft', reading_time, published_at]
    );
    const postId = result.insertId;
    if (tags?.length) {
      for (const tagName of tags) {
        const tagSlug = slugify(tagName, { lower: true, strict: true });
        await pool.execute('INSERT IGNORE INTO tags (name, slug) VALUES (?, ?)', [tagName, tagSlug]);
        const [tagRow] = await pool.execute('SELECT id FROM tags WHERE slug = ?', [tagSlug]);
        if (tagRow.length) await pool.execute('INSERT IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)', [postId, tagRow[0].id]);
      }
    }
    const [post] = await pool.execute('SELECT * FROM posts WHERE id = ?', [postId]);
    res.status(201).json({ post: post[0], message: 'Post created successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updatePost = async (req, res) => {
  const { title, content, excerpt, cover_image, category_id, status, tags } = req.body;
  const postId = req.params.id;
  try {
    const [rows] = await pool.execute('SELECT * FROM posts WHERE id = ?', [postId]);
    if (!rows.length) return res.status(404).json({ error: 'Post not found' });
    if (rows[0].author_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Forbidden' });
    const post = rows[0];
    const newTitle = title || post.title;
    const newSlug = title && title !== post.title ? makeSlug(title) : post.slug;
    const reading_time = content ? calcReadingTime(content) : post.reading_time;
    const published_at = status === 'published' && post.status !== 'published' ? new Date() : post.published_at;
    await pool.execute(
      `UPDATE posts SET title=?, slug=?, excerpt=?, content=?, cover_image=?, category_id=?, status=?, reading_time=?, published_at=?, updated_at=NOW() WHERE id=?`,
      [newTitle, newSlug, excerpt ?? post.excerpt, content || post.content, cover_image ?? post.cover_image, category_id ?? post.category_id, status || post.status, reading_time, published_at, postId]
    );
    if (tags !== undefined) {
      await pool.execute('DELETE FROM post_tags WHERE post_id = ?', [postId]);
      for (const tagName of tags) {
        const tagSlug = slugify(tagName, { lower: true, strict: true });
        await pool.execute('INSERT IGNORE INTO tags (name, slug) VALUES (?, ?)', [tagName, tagSlug]);
        const [tagRow] = await pool.execute('SELECT id FROM tags WHERE slug = ?', [tagSlug]);
        if (tagRow.length) await pool.execute('INSERT IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)', [postId, tagRow[0].id]);
      }
    }
    const [updated] = await pool.execute('SELECT * FROM posts WHERE id = ?', [postId]);
    res.json({ post: updated[0], message: 'Post updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deletePost = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT author_id FROM posts WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Post not found' });
    if (rows[0].author_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Forbidden' });
    await pool.execute('DELETE FROM posts WHERE id = ?', [req.params.id]);
    res.json({ message: 'Post deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.toggleLike = async (req, res) => {
  try {
    const [existing] = await pool.execute('SELECT 1 FROM likes WHERE user_id=? AND post_id=?', [req.user.id, req.params.id]);
    if (existing.length) {
      await pool.execute('DELETE FROM likes WHERE user_id=? AND post_id=?', [req.user.id, req.params.id]);
      res.json({ liked: false });
    } else {
      await pool.execute('INSERT INTO likes (user_id, post_id) VALUES (?,?)', [req.user.id, req.params.id]);
      res.json({ liked: true });
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.toggleBookmark = async (req, res) => {
  try {
    const [existing] = await pool.execute('SELECT 1 FROM bookmarks WHERE user_id=? AND post_id=?', [req.user.id, req.params.id]);
    if (existing.length) {
      await pool.execute('DELETE FROM bookmarks WHERE user_id=? AND post_id=?', [req.user.id, req.params.id]);
      res.json({ bookmarked: false });
    } else {
      await pool.execute('INSERT INTO bookmarks (user_id, post_id) VALUES (?,?)', [req.user.id, req.params.id]);
      res.json({ bookmarked: true });
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getBookmarks = async (req, res) => {
  try {
    const [posts] = await pool.execute(`
      SELECT p.id, p.title, p.slug, p.excerpt, p.cover_image, p.reading_time, p.published_at,
        u.username as author_username, u.full_name as author_name, u.avatar_url as author_avatar,
        c.name as category_name, c.slug as category_slug
      FROM bookmarks b
      JOIN posts p ON b.post_id = p.id
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE b.user_id = ? ORDER BY b.created_at DESC`, [req.user.id]);
    res.json({ posts });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
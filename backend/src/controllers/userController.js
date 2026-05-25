const { pool } = require('../config/database');

exports.getUserProfile = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, username, email, full_name, bio, avatar_url, role, created_at FROM users WHERE username = ?',
      [req.params.username]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    const user = rows[0];
    const [posts] = await pool.execute(`
      SELECT p.id, p.title, p.slug, p.excerpt, p.cover_image, p.reading_time, p.views, p.published_at,
        c.name as category_name, c.slug as category_slug,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) as likes_count
      FROM posts p LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.author_id = ? AND p.status = 'published'
      ORDER BY p.published_at DESC LIMIT 20`, [user.id]);
    const [stats] = await pool.execute(`
      SELECT
        (SELECT COUNT(*) FROM posts WHERE author_id = ? AND status = 'published') as total_posts,
        (SELECT COALESCE(SUM(views),0) FROM posts WHERE author_id = ?) as total_views,
        (SELECT COUNT(*) FROM likes l JOIN posts p ON l.post_id = p.id WHERE p.author_id = ?) as total_likes
    `, [user.id, user.id, user.id]);
    res.json({ user, posts, stats: stats[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, username, email, full_name, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ users });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const [[postStats]] = await pool.execute(`
      SELECT COUNT(*) as total_posts, SUM(status = 'published') as published,
        SUM(status = 'draft') as drafts, COALESCE(SUM(views), 0) as total_views FROM posts`);
    const [[userStats]] = await pool.execute('SELECT COUNT(*) as total_users FROM users');
    const [[commentStats]] = await pool.execute('SELECT COUNT(*) as total_comments FROM comments');
    const [recentPosts] = await pool.execute(`
      SELECT p.id, p.title, p.slug, p.status, p.views, p.created_at, u.username as author_username
      FROM posts p JOIN users u ON p.author_id = u.id ORDER BY p.created_at DESC LIMIT 5`);
    res.json({ ...postStats, ...userStats, ...commentStats, recent_posts: recentPosts });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
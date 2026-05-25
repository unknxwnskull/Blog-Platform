const { pool } = require('../config/database');

exports.getComments = async (req, res) => {
  try {
    const [comments] = await pool.execute(`
      SELECT c.id, c.content, c.parent_id, c.created_at, c.updated_at,
        u.id as author_id, u.username as author_username,
        u.full_name as author_name, u.avatar_url as author_avatar
      FROM comments c JOIN users u ON c.author_id = u.id
      WHERE c.post_id = ? ORDER BY c.created_at ASC`, [req.params.postId]);
    const map = {};
    const roots = [];
    comments.forEach(c => { c.replies = []; map[c.id] = c; });
    comments.forEach(c => {
      if (c.parent_id && map[c.parent_id]) map[c.parent_id].replies.push(c);
      else roots.push(c);
    });
    res.json({ comments: roots });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createComment = async (req, res) => {
  const { content, parent_id } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Comment content required' });
  try {
    const [post] = await pool.execute('SELECT id FROM posts WHERE id = ? AND status = "published"', [req.params.postId]);
    if (!post.length) return res.status(404).json({ error: 'Post not found' });
    const [result] = await pool.execute(
      'INSERT INTO comments (content, post_id, author_id, parent_id) VALUES (?, ?, ?, ?)',
      [content.trim(), req.params.postId, req.user.id, parent_id || null]
    );
    const [comment] = await pool.execute(`
      SELECT c.*, u.username as author_username, u.full_name as author_name, u.avatar_url as author_avatar
      FROM comments c JOIN users u ON c.author_id = u.id WHERE c.id = ?`, [result.insertId]);
    res.status(201).json({ comment: { ...comment[0], replies: [] } });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateComment = async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Content required' });
  try {
    const [rows] = await pool.execute('SELECT * FROM comments WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Comment not found' });
    if (rows[0].author_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    await pool.execute('UPDATE comments SET content = ?, updated_at = NOW() WHERE id = ?', [content.trim(), req.params.id]);
    res.json({ message: 'Comment updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteComment = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM comments WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Comment not found' });
    if (rows[0].author_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Forbidden' });
    await pool.execute('DELETE FROM comments WHERE id = ?', [req.params.id]);
    res.json({ message: 'Comment deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
const { pool } = require('../config/database');
const slugify = require('slugify');

exports.getCategories = async (req, res) => {
  try {
    const [categories] = await pool.execute(`
      SELECT c.*, COUNT(p.id) as post_count FROM categories c
      LEFT JOIN posts p ON c.id = p.category_id AND p.status = 'published'
      GROUP BY c.id ORDER BY c.name ASC`);
    res.json({ categories });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createCategory = async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  try {
    const slug = slugify(name, { lower: true, strict: true });
    const [result] = await pool.execute(
      'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)',
      [name, slug, description || null]
    );
    const [cat] = await pool.execute('SELECT * FROM categories WHERE id = ?', [result.insertId]);
    res.status(201).json({ category: cat[0] });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Category already exists' });
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await pool.execute('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ message: 'Category deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getTags = async (req, res) => {
  try {
    const [tags] = await pool.execute(`
      SELECT t.*, COUNT(pt.post_id) as post_count FROM tags t
      LEFT JOIN post_tags pt ON t.id = pt.tag_id
      GROUP BY t.id ORDER BY post_count DESC LIMIT 50`);
    res.json({ tags });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
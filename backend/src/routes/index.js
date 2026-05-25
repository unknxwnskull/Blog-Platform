const express = require('express');
const router = express.Router();

const auth = require('../controllers/authController');
const posts = require('../controllers/postController');
const comments = require('../controllers/commentController');
const categories = require('../controllers/categoryController');
const users = require('../controllers/userController');
const { authenticate, optionalAuth, requireAdmin } = require('../middleware/auth');

router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);
router.get('/auth/me', authenticate, auth.getMe);
router.put('/auth/profile', authenticate, auth.updateProfile);
router.put('/auth/password', authenticate, auth.changePassword);

router.get('/posts', optionalAuth, posts.getPosts);
router.get('/posts/user/bookmarks', authenticate, posts.getBookmarks);
router.get('/posts/:slug', optionalAuth, posts.getPost);
router.post('/posts', authenticate, posts.createPost);
router.put('/posts/:id', authenticate, posts.updatePost);
router.delete('/posts/:id', authenticate, posts.deletePost);
router.post('/posts/:id/like', authenticate, posts.toggleLike);
router.post('/posts/:id/bookmark', authenticate, posts.toggleBookmark);

router.get('/posts/:postId/comments', comments.getComments);
router.post('/posts/:postId/comments', authenticate, comments.createComment);
router.put('/comments/:id', authenticate, comments.updateComment);
router.delete('/comments/:id', authenticate, comments.deleteComment);

router.get('/categories', categories.getCategories);
router.post('/categories', authenticate, requireAdmin, categories.createCategory);
router.delete('/categories/:id', authenticate, requireAdmin, categories.deleteCategory);
router.get('/tags', categories.getTags);

router.get('/users/:username', users.getUserProfile);
router.get('/admin/users', authenticate, requireAdmin, users.getAllUsers);
router.get('/admin/stats', authenticate, requireAdmin, users.getDashboardStats);

module.exports = router;
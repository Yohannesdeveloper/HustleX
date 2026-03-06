const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const { auth, adminAuth } = require('../middleware/auth');

// Get all blogs with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    const skip = (page - 1) * limit;

    let query = { isPublished: true };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Blog.countDocuments(query);

    res.json({
      blogs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalBlogs: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ message: 'Failed to fetch blogs', error: error.message });
  }
});

// Get single blog by ID
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Increment view count
    await Blog.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ message: 'Failed to fetch blog', error: error.message });
  }
});

// Create new blog post (admin only)
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, category, readTime, imageUrl } = req.body;

    // Validate required fields
    if (!title || !content || !category || !readTime) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const blog = new Blog({
      title: title.trim(),
      content: content.trim(),
      category,
      readTime,
      imageUrl: imageUrl || null,
      author: 'Admin'
    });

    const savedBlog = await blog.save();
    res.status(201).json(savedBlog);
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ message: 'Failed to create blog post', error: error.message });
  }
});

// Update blog post (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { title, content, category, readTime, imageUrl } = req.body;

    const updateData = {};
    if (title) updateData.title = title.trim();
    if (content) updateData.content = content.trim();
    if (category) updateData.category = category;
    if (readTime) updateData.readTime = readTime;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.json(blog);
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ message: 'Failed to update blog post', error: error.message });
  }
});

// Delete blog post (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ message: 'Failed to delete blog post', error: error.message });
  }
});

// Like blog post
router.post('/:id/like', async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.json({ likes: blog.likes });
  } catch (error) {
    console.error('Error liking blog:', error);
    res.status(500).json({ message: 'Failed to like blog post', error: error.message });
  }
});

// Unlike blog post
router.post('/:id/unlike', async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: -1 } },
      { new: true }
    );

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Ensure likes don't go below 0
    if (blog.likes < 0) {
      await Blog.findByIdAndUpdate(req.params.id, { likes: 0 });
      blog.likes = 0;
    }

    res.json({ likes: blog.likes });
  } catch (error) {
    console.error('Error unliking blog:', error);
    res.status(500).json({ message: 'Failed to unlike blog post', error: error.message });
  }
});

// Get blog categories
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Blog.distinct('category');
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
  }
});

// Get blog statistics
router.get('/meta/stats', async (req, res) => {
  try {
    const totalBlogs = await Blog.countDocuments({ isPublished: true });
    const categories = await Blog.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const totalViews = await Blog.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);

    const totalLikes = await Blog.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: null, totalLikes: { $sum: '$likes' } } }
    ]);

    res.json({
      totalBlogs,
      categories: categories.reduce((acc, cat) => {
        acc[cat._id] = cat.count;
        return acc;
      }, {}),
      totalViews: totalViews[0]?.totalViews || 0,
      totalLikes: totalLikes[0]?.totalLikes || 0
    });
  } catch (error) {
    console.error('Error fetching blog stats:', error);
    res.status(500).json({ message: 'Failed to fetch blog statistics', error: error.message });
  }
});

module.exports = router;

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { Search, Calendar, User, MessageCircle, Facebook, Instagram, Youtube, Twitter, Pinterest, LayoutGrid, ChevronRight, ArrowLeft } from 'lucide-react';
import './Blogs.css';
import './BlogDetail.css';
import { blogsContent } from '../utils/blogData';

const BlogDetail = () => {
  const { slug } = useParams();
  
  const currentIndex = blogsContent.findIndex(b => b.slug === slug);
  const blog = blogsContent[currentIndex];
  
  const prevBlog = currentIndex > 0 ? blogsContent[currentIndex - 1] : null;
  const nextBlog = currentIndex < blogsContent.length - 1 ? blogsContent[currentIndex + 1] : null;
  
  const recentPosts = blogsContent.slice(0, 3);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!blog) {
    return (
      <div className="container py-5 text-center" style={{ marginTop: '100px', minHeight: '60vh' }}>
        <h2>Blog post not found</h2>
        <Link to="/blogs" className="btn-primary mt-4 d-inline-block">Back to Blogs</Link>
      </div>
    );
  }

  return (
    <div className="blog-detail-page py-5">
      <SEO title={blog.title} description={blog.description} />
      
      <div className="container">
        <div className="row">
          
          {/* Sidebar */}
          <div className="col-lg-3 sidebar-column">
            
            {/* Search Widget */}
            <div className="sidebar-widget">
              <h4 className="widget-title"><span></span> Search</h4>
              <div className="search-box">
                <input type="text" placeholder="Search our store" />
                <button type="submit"><Search size={18} /></button>
              </div>
            </div>

            {/* Recent Posts Widget */}
            <div className="sidebar-widget">
              <h4 className="widget-title"><span></span> Recent Post</h4>
              <div className="recent-posts-list">
                {recentPosts.map(post => (
                  <div className="recent-post-item" key={post.slug}>
                    <Link to={`/blogs/${post.slug}`} className="recent-post-img">
                      <img src={post.image} alt={post.title} />
                    </Link>
                    <div className="recent-post-info">
                      <h5><Link to={`/blogs/${post.slug}`}>{post.title.substring(0, 30)}...</Link></h5>
                      <span className="recent-post-date"><Calendar size={12} /> {post.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Never Miss News Widget */}
            <div className="sidebar-widget">
              <h4 className="widget-title"><span></span> Never Miss News</h4>
              <div className="social-icons-widget">
                <a href="#" className="social-icon"><Facebook size={16} /></a>
                <a href="#" className="social-icon"><Instagram size={16} /></a>
                <a href="#" className="social-icon"><Youtube size={16} /></a>
              </div>
            </div>
            
          </div>

          {/* Main Content */}
          <div className="col-lg-9 main-content-column">
            
            {/* Featured Image */}
            <div className="blog-featured-image">
              <img src={blog.image} alt={blog.title} className="img-fluid" />
            </div>
            
            {/* Title */}
            <h1 className="blog-main-title">{blog.title}</h1>
            
            {/* Meta Info */}
            <div className="blog-meta-info">
              <span><User size={14} /> by: support.nuzvidagrifarms Admin</span>
              <span><Calendar size={14} /> {blog.date}</span>
              <span><MessageCircle size={14} /> 0 comments</span>
            </div>
            
            {/* Content */}
            <div className="blog-full-content">
              {blog.content}
            </div>
            
            {/* Tags and Share */}
            <div className="blog-tags-share">
              <div className="blog-tags">
                <strong>Tags</strong>
                {/* <span>{blog.category}</span> */}
              </div>
              <div className="blog-share">
                <strong>Share This Post</strong>
                <a href="#"><Facebook size={14} /></a>
                <a href="#"><Twitter size={14} /></a>
                <a href="#"><Pinterest size={14} /></a>
              </div>
            </div>
            
            {/* Prev / Next Navigation */}
            <div className="blog-navigation">
              {prevBlog ? (
                <div className="nav-prev">
                  <span className="nav-label">Prev Post</span>
                  <Link to={`/blogs/${prevBlog.slug}`} className="nav-title">
                    {prevBlog.title.substring(0, 30)}...
                  </Link>
                </div>
              ) : <div className="nav-prev"></div>}
              
              <div className="nav-center-icon">
                <LayoutGrid size={24} color="#ccc" />
              </div>
              
              {nextBlog ? (
                <div className="nav-next text-end">
                  <span className="nav-label">Next Post</span>
                  <Link to={`/blogs/${nextBlog.slug}`} className="nav-title">
                    {nextBlog.title.substring(0, 30)}...
                  </Link>
                </div>
              ) : <div className="nav-next text-end"></div>}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default BlogDetail;

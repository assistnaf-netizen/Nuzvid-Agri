import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { ChevronRight, Calendar, ArrowLeft } from 'lucide-react';
import './Blogs.css';
import { blogsContent } from '../utils/blogData';

const BlogDetail = () => {
  const { slug } = useParams();
  
  const blog = blogsContent.find(b => b.slug === slug);

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
    <div className="blog-detail-page">
      <SEO title={blog.title} description={blog.description} />
      
      <div className="blog-detail-hero">
        <div className="container">
          <div className="breadcrumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Link to="/"><ArrowLeft size={16} /> Home</Link> <ChevronRight size={14} /> 
            <Link to="/blogs">Blogs</Link> <ChevronRight size={14} />
            <span style={{ color: '#8b4513' }}>{blog.title}</span>
          </div>
          <h1 className="blog-detail-title mt-4">{blog.title}</h1>
          <div className="blog-detail-meta d-flex justify-content-center align-items-center gap-3 mt-3">
            <span className="d-flex align-items-center gap-2"><Calendar size={16} /> {blog.date}</span>
            <span className="blog-category-badge px-3 py-1" style={{ background: '#f5efe6', borderRadius: '20px', fontSize: '0.9rem', color: '#8b4513' }}>{blog.category}</span>
          </div>
        </div>
      </div>

      <div className="container pb-5 pt-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="blog-content-wrapper" style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#444' }}>
              {blog.content}
            </div>
            <div className="text-center mt-5 pt-4 border-top">
              <Link to="/blogs" className="btn btn-outline-dark px-4 py-2" style={{ borderRadius: '30px' }}>Read More Articles</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;

import React from 'react';
import InformComponent from '../info/components/inform';
import PostFeed from '../posts/components/PostFeed';
import AdsFeed from '../ads/components/AdsFeed';
import Footer from '../footer/components/Footer';
import '../shared/fonts/fonts.scss';

const Home: React.FC = () => {
  return (
    <div>
      <InformComponent />
      <hr />
      <PostFeed />
      <hr />
      <AdsFeed />
      <hr />
      <Footer />
    </div>
  );
};

export default Home;

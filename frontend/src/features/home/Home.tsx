import React from 'react';
import InformComponent from '../info/components/inform';
import AdsFeed from '../ads/components/ads-feed';
import Footer from '../footer/components/Footer';
import '../shared/fonts/fonts.scss';


const Home: React.FC = () => {
  return (
    <div>
      <InformComponent />
      <hr />
      <AdsFeed />
      <hr />
      <Footer />
    </div>
  );
};

export default Home;

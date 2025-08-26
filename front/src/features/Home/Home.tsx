// front/src/features/Home/Home.tsx
import React from 'react';
import homeStyles from './home.module.scss';

const Home: React.FC = () => {
  return (
    <>
      <div className={homeStyles.test}>
          Здарова Иван!!
      </div>
      <div className={homeStyles.test2}>
        HELLO
      </div>
    </>
  );
};

export default Home;
import React from 'react';
import Content from '@theme-original/Navbar/Content';
import UserProfile from '../../../components/UserProfile';
import styles from './styles.module.css';

export default function ContentWrapper(props) {
  return (
    <>
      <Content {...props} />
      <div className={styles.userProfileContainer}>
        <UserProfile />
      </div>
    </>
  );
}

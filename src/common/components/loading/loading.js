import React from 'react';

import Loader from 'react-loader-spinner';

import style from './style.module.css';

const Loading = () => (
  <div className={style.spinner}>
    <Loader type='ThreeDots' color='#2BAD60' height='100' width='100' />
  </div>
);

export default Loading;
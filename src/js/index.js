import ReactDOM from 'react-dom';
import React from 'react';
import { Button } from 'antd';

import '../less/index.less';
import '../css/a.css'
import "antd/dist/antd.css";



ReactDOM.render(
  <>
    <Button type="primary">Primary Button</Button>
    <Button>Default Button</Button>
    <Button type="dashed">Dashed Button</Button>
    <br />
    <Button type="text">Text Button</Button>
    <Button type="link">Link Button</Button>
  </>,
  document.getElementById('app'),
);
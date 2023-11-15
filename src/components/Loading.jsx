import React from "react";
import styles from "./Loading.module.css"

const Loading = () => {
  return (
    <div className={styles.simple_spinner}>
      <span></span>
    </div>
  );
};

export default Loading;

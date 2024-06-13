"use client";

import { BallTriangle } from "react-loader-spinner";
import classes from "./loading.module.css";

export default function Loading() {
  return (
    <BallTriangle
      height={100}
      width={100}
      radius={5}
      color="#4fa94d"
      ariaLabel="ball-triangle-loading"
      wrapperStyle={{}}
      wrapperClass={classes.loading}
      visible={true}
    />
  );
}

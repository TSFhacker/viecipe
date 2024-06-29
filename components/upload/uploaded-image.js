// components/CustomImage.js
import Image from "next/image";
import React from "react";

const UploadedImage = ({ block, contentState }) => {
  const { src } = contentState.getEntity(block.getEntityAt(0)).getData();
  return (
    <img
      src={src}
      style={{ width: "50%", height: "auto", maxWidth: "500px" }}
      alt=""
    />
  );
};

export default UploadedImage;

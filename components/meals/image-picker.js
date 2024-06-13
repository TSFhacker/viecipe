"use client";

import { useRef, useState } from "react";
import classes from "./image-picker.module.css";
import Image from "next/image";

export default function ImagePicker({
  label,
  name,
  profilePicture,
  setProfilePicture,
  imageRef,
}) {
  const [pickedImage, setPickedImage] = useState();
  const imageInput = useRef();
  function handlePickClick() {
    imageRef?.current.click();
    imageInput.current?.click();
  }

  function handleImageChange(event) {
    const file = event.target.files[0];

    if (!file) {
      profilePicture && setProfilePicture(null);
      setPickedImage(null);
      return;
    }

    const fileReader = new FileReader();
    fileReader.onload = () => {
      profilePicture && setProfilePicture(fileReader.result);
      setPickedImage(fileReader.result);
    };
    fileReader.readAsDataURL(file);
  }

  return (
    <div className={classes.picker}>
      <label htmlFor="image">{label}</label>
      <div className={classes.controls}>
        <div className={classes.preview}>
          {!pickedImage && <p>Chưa có ảnh.</p>}
          {pickedImage && (
            <Image src={pickedImage} alt="Hình ảnh được chọn" fill />
          )}
        </div>
        <input
          className={classes.input}
          type="file"
          id="image"
          accept="image/png, image/jpeg"
          name={name}
          ref={imageRef || imageInput}
          onChange={handleImageChange}
          required
        />
        <button
          className={classes.button}
          type="button"
          onClick={handlePickClick}
        >
          Chọn ảnh
        </button>
      </div>
    </div>
  );
}

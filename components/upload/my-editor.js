// components/RichTextEditor.js
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AtomicBlockUtils,
  EditorState,
  RichUtils,
  convertToRaw,
} from "draft-js";
import Editor from "@draft-js-plugins/editor";
import createImagePlugin from "@draft-js-plugins/image";
import createUndoPlugin from "@draft-js-plugins/undo";
import createLinkPlugin from "@draft-js-plugins/anchor";
import createVideoPlugin from "@draft-js-plugins/video";
import editorStyles from "./my-editor-styles.module.css";
import createToolbarPlugin, {
  Separator,
} from "@draft-js-plugins/static-toolbar";

import {
  ItalicButton,
  BoldButton,
  UnderlineButton,
  CodeButton,
  HeadlineOneButton,
  HeadlineTwoButton,
  HeadlineThreeButton,
  UnorderedListButton,
  OrderedListButton,
  BlockquoteButton,
  CodeBlockButton,
} from "@draft-js-plugins/buttons";

import "@draft-js-plugins/image/lib/plugin.css";
import "@draft-js-plugins/static-toolbar/lib/plugin.css";
import { IoMdAttach } from "react-icons/io";

const undoPlugin = createUndoPlugin();
const imagePlugin = createImagePlugin();
const linkPlugin = createLinkPlugin();
const toolbarPlugin = createToolbarPlugin();
const videoPlugin = createVideoPlugin();

const plugins = [
  undoPlugin,
  imagePlugin,
  linkPlugin,
  toolbarPlugin,
  videoPlugin,
];
const { Toolbar } = toolbarPlugin;

const HeadlinesPicker = (props) => {
  const { onOverrideContent } = props;

  useEffect(() => {
    let count = 0;
    const onWindowClick = () => {
      if (count === 0) {
        count++;
        return;
      }
      count++;
      onOverrideContent(undefined);
    };

    window.addEventListener("click", onWindowClick);

    return () => {
      window.removeEventListener("click", onWindowClick);
    };
  }, [onOverrideContent]);

  const buttons = [HeadlineOneButton, HeadlineTwoButton, HeadlineThreeButton];

  return (
    <div>
      {buttons.map((Button, i) => (
        <Button key={i} {...props} />
      ))}
    </div>
  );
};

const HeadlinesButton = ({ onOverrideContent }) => {
  const onClick = useCallback(() => {
    onOverrideContent(HeadlinesPicker);
  }, [onOverrideContent]);

  return (
    <div className={editorStyles.headlineButtonWrapper}>
      <button onClick={onClick} className={editorStyles.headlineButton}>
        H
      </button>
    </div>
  );
};

const MyEditor = ({ editorRef }) => {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );
  const [content, setContent] = useState("");
  const imageRef = useRef();

  const handlePickClick = () => {
    imageRef?.current.click();
  };

  const handleEditorChange = (state) => {
    setEditorState(state);
    const contentState = state.getCurrentContent();
    const rawContentState = convertToRaw(contentState);
    setContent(
      rawContentState?.blocks.length === 1 &&
        rawContentState?.blocks[0].text === "" &&
        rawContentState?.blocks[0].style === "unstyled"
        ? ""
        : JSON.stringify(rawContentState)
    );
  };

  const handleKeyCommand = (command) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  };

  const toggleBlockType = (blockType) => {
    setEditorState(RichUtils.toggleBlockType(editorState, blockType));
  };

  const toggleInlineStyle = (inlineStyle) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, inlineStyle));
  };

  const addImage = (url) => {
    setEditorState(imagePlugin.addImage(editorState, url));
  };

  const addVideo = (url) => {
    setEditorState(videoPlugin.addVideo(editorState, url));
  };

  // const addLink = () => {
  //   const url = prompt("Enter a URL:");
  //   if (!url) return;
  //   setEditorState(linkPlugin.addLink(editorState, { url }));
  // };

  const handleFileInput = (e) => {
    const file = e.target.files[0];

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      if (file.type.startsWith("image/")) addImage(dataUrl);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div style={{ marginBottom: "10px" }}>
        <input
          className={editorStyles.imageInput}
          type="file"
          id="image"
          accept="image/png, image/jpeg"
          ref={imageRef}
          onChange={handleFileInput}
        />
      </div>
      <input
        name="instructions"
        className={editorStyles.hiddenInput}
        value={content}
        require
      />
      <div className={editorStyles.editor}>
        {editorState && (
          <Editor
            editorState={editorState}
            onChange={handleEditorChange}
            handleKeyCommand={handleKeyCommand}
            plugins={plugins}
          />
        )}
        <Toolbar>
          {(externalProps) => (
            <>
              <BoldButton {...externalProps} />
              <ItalicButton {...externalProps} />
              <UnderlineButton {...externalProps} />
              <CodeButton {...externalProps} />
              <Separator {...externalProps} />
              <HeadlinesButton {...externalProps} />
              <UnorderedListButton {...externalProps} />
              <OrderedListButton {...externalProps} />
              <BlockquoteButton {...externalProps} />
              <CodeBlockButton {...externalProps} />
              <button
                className={editorStyles.headlineButton}
                type="button"
                onClick={handlePickClick}
              >
                <IoMdAttach />
              </button>
            </>
          )}
        </Toolbar>
      </div>
    </div>
  );
};

export default MyEditor;

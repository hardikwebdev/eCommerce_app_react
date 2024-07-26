import { React, useState, useEffect, useCallback } from "react";
import { Close, ExpandMore, Add } from "@material-ui/icons";
import { CircularProgress } from "@material-ui/core";
import { Button, Form, Modal } from "react-bootstrap";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  addProduct,
  addProductImage,
  deleteProduct,
  editProduct,
  removeFromS3,
  getGeneralAttributes,
} from "../../app/crud/auth.crud";
import { useSelector, shallowEqual } from "react-redux";
import clsx from "clsx";
import { useDropzone } from "react-dropzone";
import imageCompression from "browser-image-compression";

export const AddProduct = (props) => {
  const [srcImg, setSrcImg] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [show, setShow] = useState(false);
  const [isFirst, setIsFirst] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [isRendered, setIsRendered] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { authToken, userid } = useSelector(
    ({ auth }) => ({
      authToken: auth.user.token,
      userid: auth.user.id,
    }),
    shallowEqual
  );

  useEffect(() => {
    if (!isRendered && props.activeFile.length > 0) {
      props.activeFile.map((val, ind) => {
        if (parseInt(val.index) === parseInt(props.fileIndex)) {
          setIsRendered(true);
          setSelectedFiles([props?.activeFile[ind].image_url]);
          setSrcImg(props?.activeFile[ind].image_url);
          setImageUrl(props?.activeFile[ind].image_url);
        }
      });
    }
  }, [props.activeFile]);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setShowSubUpload(true);
      setLoading(true);
      let photosArray = [];

      await acceptedFiles.map(async (file) => {
        // if (file.size > 5000000) {
        const options = {
          maxSizeMB: 5,
          minSizeMB: 1,
          maxWidthOrHeight: 1350,
          minWidthOrHeight: 1080,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);
        file = compressedFile;
        // }
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          setSrcImg(reader.result);
          photosArray.push(reader.result);
          var data = {
            files: JSON.stringify(photosArray),
            userId: userid,
          };
          addProductImage(authToken, data)
            .then((result) => {
              if (result && result.data.code === 200) {
                var url = result.data.payload.url;
                var d1 = [...selectedFiles];
                d1.push(url);
                setSelectedFiles(d1);
                setImageUrl(url);
              }
              setLoading(false);
            })
            .catch((err) => {
              // showToast("error", err);
              setLoading(false);
            });
        };
      });
    }
  }, []);

  const onRemoveImage = async (source, ind, item) => {
    setLoading(false);
    var d = [...source];

    d = d.filter((it, index) => index != ind);
    if (item === srcImg) {
      setSrcImg(null);
      if (d.length > 0) {
        setSrcImg(d[d.length - 1]);
      }
    }

    if (d.length === 0) {
      setIsFirst(true);
    }
    setSelectedFiles(d);
    setIsRendered(false);
    if (!props.isUpdate) {
      await removeFromS3(authToken, { image_url: imageUrl })
        .then(() => {
          props.removeImage(imageUrl);
        })
        .catch((err) => {
          console.log("ERROR : ", err);
        });
    } else {
      if (props.newAddedImages.some((val) => val.image_url === imageUrl)) {
        await removeFromS3(authToken, { image_url: imageUrl })
          .then(() => {
            props.removeImage(imageUrl);
          })
          .catch((err) => {
            console.log("ERROR : ", err);
          });
      } else {
        props.removeImage(imageUrl);
      }
    }
  };

  const onImgLoad = async ({ target: img }) => {
    setHeight(img.naturalHeight);
    setWidth(img.naturalWidth);
    props.setErrorMsg("");
    if (img.naturalWidth > 1080 && img.naturalHeight > 1350) {
      var d = [...selectedFiles];
      if (isFirst) {
        d.pop();
        setIsFirst(false);
      }
      setSelectedFiles(d);
      setShow(true);
      await removeFromS3(authToken, { image_url: imageUrl })
        .then(() => {
          props.removeImage(imageUrl);
        })
        .catch((err) => {
          console.log("ERROR : ", err);
        });
    } else {
      if (isFirst) {
        setIsFirst(false);
      }
      if (!isRendered) {
        props.setImageFile({ image_url: imageUrl, index: props.fileIndex });
      }
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
    },
    maxFiles: 1,
    multiple: false,
  });

  return (
    <>
      <div className="row">
        <div className="col-12 mt-3">
          <div className="text-center position-relative">
            {srcImg && selectedFiles.length !== 0 ? (
              <>
                <img
                  onLoad={onImgLoad}
                  src={srcImg}
                  hidden={show ? true : false}
                  alt="images"
                  id="source"
                  className="img-fluid h-320 mx-auto"
                />
                <Close
                  className="product-close-icon text-white"
                  onClick={() => onRemoveImage(selectedFiles, 0, srcImg)}
                />
              </>
            ) : (
              <div
                {...getRootProps({
                  className:
                    "dropzone border-black-dashed py-5 px-4 h-320 max-w-300 mx-auto d-flex flex-column align-items-center justify-content-center cursor-pointer",
                })}
              >
                <div>
                  {!loading ? (
                    <Add className="text-slate-gray font-95" />
                  ) : (
                    <CircularProgress className="text-slate-gray font-95" />
                  )}
                </div>
                <div>
                  <input {...getInputProps()} />
                  <p className="text-black-3 font-InterLight font-18">
                    Add photos or drag <br /> and drop
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* <div className="max-w-300 mx-auto">{renderPhotos()}</div> */}
        </div>
      </div>
      <Modal
        size="md"
        className="w-500 h-300"
        show={show}
        onHide={() => {
          setShow(false);
        }}
        centered
        style={{ opacity: 1 }}
      >
        {show && renderModalBody()}
      </Modal>
    </>
  );
};

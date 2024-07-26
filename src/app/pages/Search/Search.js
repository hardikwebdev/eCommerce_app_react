import React, { useState, useEffect } from "react";
import { withRouter, useHistory, useLocation } from "react-router-dom";
import TitleComponent from "../../../components/Common/TitleComponent";
import SingleProduct from "../../../components/Common/SingleProduct";
import FilterProduct from "../../../components/Common/FilterProduct";
import { TextField, InputAdornment } from "@material-ui/core";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { Formik } from "formik";
import { ArrowRightAlt } from "@material-ui/icons";
import { Button, Form, Modal } from "react-bootstrap";
import {
  searchProducts,
  addToFavorites,
  getFavorites,
} from "../../crud/auth.crud";
import { CircularProgress } from "@material-ui/core";
import {
  addSearchProduct,
  removeSearchProduct,
} from "../../../redux/actions/searchProductAction";
// import Pagination from "react-js-pagination";
import Pagination from "../../../components/Common/Pagination";
import {
  addFavorite,
  removeFavorite,
} from "../../../redux/actions/favoriteAction";
import * as Yup from "yup";
import CmtInputBox from "../../../components/Common/CmtInputBox";

function Search(props) {
  const history = useHistory();
  const [searchData, setSearchData] = useState([]);
  const [paginatedPosts, setPaginatedPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [availability_status, setAvailabilityStatus] = useState(0);
  const [priceArr, setPriceArr] = useState([]);
  const [meta_type, setMetaTypeArr] = useState([]);
  const [meta_value, setMetaValueArr] = useState([]);
  const [closet, setCloset] = useState([]);
  const [occasionArr, setOccasionArr] = useState([]);
  const [location, setLocation] = useState({ zip_code: "", selected_mile: "" });
  const [sortBy, setSortBy] = useState(0);
  const [date_range, setDateRange] = useState([]);
  const [filters, setFilters] = useState(false);

  const [activePage, setActivePage] = useState(1);
  const [limit, setlimit] = useState(9);
  const [productCount, setProductCount] = useState(0);
  const [filterTypes, setFilterTypes] = useState([]);
  const [mainCategoryFilter, setMainCategoryFilter] = useState([]);
  const [category, setCategory] = useState({});
  const [favorites, setFavorites] = useState([]);
  const [addedFilters, setAddedFilters] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [hasAutoShowedModal, setHasAutoShowedModal] = useState(false);

  const dispatch = useDispatch();
  const locationHistory = useLocation();

  const { authToken, authUser } = useSelector(
    ({ auth }) => ({
      authToken: auth?.user?.token,
      authUser: auth?.user,
    }),
    shallowEqual
  );

  const { favoritesId } = useSelector(
    ({ favoriteReducer }) => ({
      favoritesId: favoriteReducer.favorites,
    }),
    shallowEqual
  );

  const { searchedProducts } = useSelector(
    ({ searchProduct }) => ({ searchedProducts: searchProduct.products }),
    shallowEqual
  );

  const { searchtext } = useSelector(
    ({ searchProduct }) => ({ searchtext: searchProduct.searchtext }),
    shallowEqual
  );

  const { type } = useSelector(
    ({ searchProduct }) => ({ type: searchProduct.type }),
    shallowEqual
  );

  const validationSchema = Yup.object().shape({
    zip_code: Yup.string()
      .matches(/^[0-9]{5}(?:-[0-9]{4})?$/, "Must be a valid ZIP code")
      .required("ZIP code is required"),
    selected_mile: Yup.string().required("Please select a radius."),
  });

  const handleDoneClick = async (key, value) => {
    if (key === "location") {
      setLocation(value);
    }
  };

  useEffect(() => {
    checkSearchHandler();
  }, [
    availability_status,
    priceArr,
    meta_value,
    closet,
    location,
    sortBy,
    date_range,
    occasionArr,
  ]);

  useEffect(() => {
    getFavoritesHandler();
  }, [favoritesId]);

  const setSearchDataHandler = () => {
    setSearchData([...searchedProducts]);
    let d = [...searchedProducts];
    d = d.splice(activePage, limit);
    console.log("Set Paginated Post 3");
    setPaginatedPosts([...d]);
  };

  useEffect(() => {
    setSearchDataHandler();

    return () => {
      dispatch(removeSearchProduct());
      console.log("Set Paginated Post 4");
      setPaginatedPosts([]);
    };
  }, []);

  const paginationChangeHandler = async () => {
    let offsetStart = (activePage - 1) * limit;
    const offsetEnd = limit;
    const orgD = [...searchData];
    let data = orgD.splice(offsetStart, offsetEnd);
    // data = data.sort((a,b) => b.rented_count > a.rented_count ? 1 : -1);
    console.log("Set Paginated Post 5");
    setPaginatedPosts([...data]);
  };

  useEffect(() => {
    paginationChangeHandler();
  }, [limit, activePage]);

  useEffect(() => {
    setTimeout(() => {
      if (!hasAutoShowedModal) {
        setShowModal(true);
        setHasAutoShowedModal(true);
      }
    }, 10000);
  });

  const onProductClick = (item, text, filtersObj, filtersObjOnPage) => {
    history.push({
      pathname: `/product-details/ryc_jhf_${item.id}`,
      state: {
        productId: item.id,
        fromPage: "search",
        isLocalPickup: location,
        searchText: text,
        filtersObj: filtersObj,
        filtersObjOnPage: filtersObjOnPage,
      },
    });
  };

  const getFilterTypes = (item) => {
    setFilterTypes(item);
  };

  return (
    <>
      <TitleComponent title={props.title} icon={props.icon} />
      <section
        className={`bg-light-gray ${
          searchtext === "" && searchData.length <= 0 ? "search-min-height" : ""
        }`}
      >
        {searchData.length <= 0 && !filters && (
          <div className="container">
            <div className="row">
              <div className="col-12 text-black text-decoration-none align-items-center justify-content-center font-30 font-InterExtraLight mt-5">
                <h3 className="text-center">Search</h3>

                <Formik
                  enableReinitialize
                  validateOnChange={false}
                  validateOnBlur={false}
                  validate={(values) => {
                    const errors = {};

                    if (values.searchText.trim().length <= 0) {
                      errors.searchText = "Provide valid search text";
                    }

                    return errors;
                  }}
                  onSubmit={(values, { setStatus, setSubmitting }) => {
                    console.log("HANDLE SEARCH SUBMIT 4");
                    handleSearchSubmit(values);
                  }}
                  initialValues={{
                    searchText: searchtext ? searchtext : "",
                  }}
                >
                  {({
                    handleSubmit,
                    values,
                    errors,
                    touched,
                    handleChange,
                    handleBlur,
                  }) => (
                    <Form noValidate={true} onSubmit={handleSubmit}>
                      <div className="row mx-0 my-4 justify-content-center align-items-center">
                        <div className="col-md-5">
                          <TextField
                            id="outlined-basic"
                            label="Search"
                            variant="outlined"
                            name="searchText"
                            className="w-100 search"
                            onChange={handleChange}
                            onBlur={handleBlur("searchText")}
                            value={values.searchText}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  {values.searchText.length <= 0 ? (
                                    <img
                                      src="/media/images/search.png"
                                      className="mb-1"
                                    />
                                  ) : (
                                    <button
                                      type="submit"
                                      className="btn shadow-none"
                                    >
                                      <ArrowRightAlt />
                                    </button>
                                  )}
                                </InputAdornment>
                              ),
                            }}
                          />
                          {touched.searchText && errors.searchText && (
                            <div>
                              <span
                                className="text-danger"
                                style={{ fontSize: "18px" }}
                                role="alert"
                              >
                                {errors.searchText}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          </div>
        )}
      </section>

      <>
        <section className="bg-light-gray">
          <div className="container">
            <div className="row">
              {searchtext != undefined && searchtext != "" && (
                <div className="col-12">
                  <h1 className="text-brown font-CambonRegular font-35 text-uppercase py-3">
                    RESULTS FOR “{searchtext}”
                  </h1>
                </div>
              )}
              {searchtext != undefined && searchtext != "" && (
                <div className="col-12 col-lg-3 d-none d-lg-block">
                  <div className="row mx-0">
                    <div className="col-12 col-lg-10 ps-0 mt-2 pt-2 border-light-black">
                      <h3 className="font-16 text-black-3 font-InterRegular text-uppercase">
                        CATEGORY
                      </h3>
                    </div>

                    <div className="col-12 mt-3 ps-0">
                      <ul className="mb-0 list-unstyled">
                        {filterTypes.map((item, index) => (
                          <li key={index}>
                            <a
                              className={`font-16 text-black-3 mt-2 mb-0 text-decoration-none cursor-pointer font-InterRegular ${
                                item.active ? "fw-bold" : ""
                              }`}
                              onClick={() =>
                                categoryFilter(item.type, "mainCategory")
                              }
                            >
                              {item.type}
                            </a>
                            <ul className="mb-0 list-unstyled">
                              {item.subtype.map((i, index) => (
                                <li key={index}>
                                  <a
                                    className={`font-16 text-black-3 font-InterLight cursor-pointer text-decoration-none ms-3 ${
                                      i.active ? "fw-bold" : ""
                                    }`}
                                    onClick={() =>
                                      categoryFilter(i.name, "innerFilter")
                                    }
                                  >
                                    {i.name}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              <div className="col-12 col-lg-9">
                {searchtext != undefined && searchtext != "" && (
                  <FilterProduct
                    setAvailabilityStatus={setAvailabilityStatus}
                    priceArr={priceArr}
                    setPriceArr={setPriceArr}
                    meta_type={meta_type}
                    meta_value={meta_value}
                    setMetaTypeArr={setMetaTypeArr}
                    setMetaValueArr={setMetaValueArr}
                    closet={closet}
                    setCloset={setCloset}
                    location={location}
                    setLocation={setLocation}
                    setSortBy={setSortBy}
                    date_range={date_range}
                    setDateRange={setDateRange}
                    setActivePage={setActivePage}
                    getFilterTypes={getFilterTypes}
                    setMainCategoryFilter={setMainCategoryFilter}
                    mainCategoryFilter={mainCategoryFilter}
                    category={category}
                    categoryFilter={categoryFilter}
                    setAddedFilters={setAddedFilters}
                    addedFilters={addedFilters}
                    filterTypes={filterTypes}
                    occasion={occasionArr}
                    setOccasion={setOccasionArr}
                  />
                )}

                <div className="row">
                  {loading ? (
                    <div className="text-center py-5">
                      {" "}
                      <CircularProgress color="inherit" />{" "}
                    </div>
                  ) : paginatedPosts.length > 0 ? (
                    paginatedPosts?.map((item, index) => (
                      <div
                        className="col-12 col-md-6 col-xl-4 mt-4"
                        key={index}
                      >
                        <SingleProduct
                          title={item.title}
                          price={item?.rental_fee["2weeks"]}
                          isSearch={true}
                          productData={item}
                          img={item.ProductImages[0]?.image_url}
                          showActiveIcon={true}
                          showStatus={false}
                          onClick={() => {
                            let tempObjOnPage = {
                              priceArr,
                              meta_type,
                              meta_value,
                              closet,
                              location,
                              date_range,
                              mainCategoryFilter,
                              category,
                              filterTypes,
                              occasionArr,
                              activePage,
                              availability_status,
                            };
                            let tempObj = {
                              ...addedFilters,
                              location: location,
                              availability_status: availability_status,
                              date_range: date_range,
                            };
                            onProductClick(
                              item,
                              searchtext,
                              tempObj,
                              tempObjOnPage
                            );
                          }}
                          isFavorite={
                            favorites ? favorites.includes(item.id) : false
                          }
                          addToFavoritesHandler={addToFavoritesHandler}
                        />
                      </div>
                    ))
                  ) : (
                    searchtext != undefined &&
                    searchtext != "" && (
                      <div className="row justify-content-center">
                        {" "}
                        <div className="col-12 col-lg-8 text-black d-flex text-decoration-none py-5 bg-testimonial-box br-20 align-items-center justify-content-center font-30 font-InterLight mt-5 mb-5 shadow">
                          <div>
                            <h5 className="text-center">
                              {filters
                                ? "No results found for selected filters."
                                : searchtext?.length <= 0
                                ? "No results found"
                                : `No results found for “${searchtext}”.`}
                            </h5>
                            <h5 className="text-center">
                              {filters
                                ? "Check with different filters."
                                : " Check the spelling or use a different word or phrase."}
                            </h5>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>

                {paginatedPosts.length > 0 && (
                  <div className="d-flex justify-content-center align-items-center py-5 cus-pagination">
                    <Pagination
                      className="pagination-bar"
                      currentPage={activePage}
                      totalCount={productCount}
                      pageSize={limit}
                      onPageChange={(page) => setActivePage(page)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </>

      <Modal
        size="md"
        centered="true"
        show={showModal}
        onHide={() => {
          setShowModal(false);
        }}
        style={{ opacity: 1 }}
      >
        {showModal && renderModalBody()}
      </Modal>
    </>
  );
}

export default withRouter(Search);

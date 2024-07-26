import { React, useState, useEffect } from "react";
import TitleComponent from "../../../components/Common/TitleComponent";
import clsx from "clsx";
import { ExpandMore } from "@material-ui/icons";
import SingleProduct from "../../../components/Common/SingleProduct";
import {
  upcomingRentals,
  currentlyRotated,
  myClothes,
  myRentals,
  activateDeactivateAllItems,
  getUserProfile,
  orderHistroy,
  getCards,
  getWalletDetails,
} from "../../crud/auth.crud";
import { AddProduct } from "../../../components/Common/AddProduct";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { dispatchLogout } from "../../../redux/actions/authAction";
import { useHistory, Link, useLocation } from "react-router-dom";
import "react-image-crop/dist/ReactCrop.css";
import { Modal, Form, Col, Button } from "react-bootstrap";
import { showToast } from "../../../utils/utils";
import { Account } from "./Account";
import Pagination from "../../../components/Common/Pagination";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@material-ui/core";
import moment from "moment";

const tabList = [
  { name: "My Closet", tabType: "closet", active: true },
  { name: "Active Orders", tabType: "Active_Orders", active: false },
  { name: "Order History", tabType: "Order_History", active: false },
  { name: "Account Details", tabType: "account", active: false },
];

export const Profile = (props) => {
  const [productData, setProductData] = useState([]);
  const [currentlyRotate, setCurrentlyRotated] = useState([]);
  const [rentalData, setRentalData] = useState([]);
  const [myclothes, setMyClothes] = useState([]);
  const [TabType, setTabType] = useState("closet");
  const [sortBy, setSortBy] = useState(null);
  const [productManageView, setProductManageView] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [userProfile, setUserProfile] = useState({});
  const [warningModal, setWarningModal] = useState(false);
  const [shippingAddress, setShippingAddress] = useState([]);
  const [rentalActivePage, setRentalActivePage] = useState(1);
  const [rentalLimit, setRentalLimit] = useState(4);
  const [paginatedRental, setPaginatedRental] = useState([]);
  const [myClothesActivePage, setMyClothesActivePage] = useState(1);
  const [myClothesLimit, setMyClothesLimit] = useState(11);
  const [paginatedMyClothes, setPaginatedMyClothes] = useState([]);
  const [upcomingRentalActivePage, setUpcomingRentalActivePage] = useState(1);
  const [upcomingRentalLimit, setUpcomingRentalLimit] = useState(4);
  const [paginatedUpcomingRental, setPaginatedUpcomingRental] = useState([]);
  const [currentlyRotatedActivePage, setCurrentlyRotatedActivePage] =
    useState(1);
  const [currentlyRotatedLimit, setCurrentlyRotatedLimit] = useState(4);
  const [paginatedCurrentlyRotated, setPaginatedCurrentlyRotated] = useState(
    []
  );
  const [orderHistoryData, setOrderHistroyData] = useState([]);
  const [orderIntoClosetLimit, setOrderIntoClosetLimit] = useState(2);
  const [orderIntoClosetActivePage, setOrderIntoClosetActivePage] = useState(1);
  const [orderIntoClosetCount, setOrderIntoClosetCount] = useState(0);
  const [orderHistoryOutofClosetData, setOrderHistroyOutofClosetData] =
    useState([]);
  const [orderOutofClosetLimit, setOrderOutofClosetLimit] = useState(2);
  const [orderOutofClosetActivePage, setOrderOutofClosetActivePage] =
    useState(1);
  const [orderOutofClosetCount, setOrderOutofClosetCount] = useState(0);
  const [activeOrderData, setActiveOrderData] = useState([]);
  const [activeOrderIntoClosetLimit, setActiveOrderIntoClosetLimit] =
    useState(2);
  const [activeOrderIntoClosetActivePage, setActiveOrderIntoClosetActivePage] =
    useState(1);
  const [activeOrderIntoClosetCount, setActiveOrderIntoClosetCount] =
    useState(0);
  const [activeOrderyOutofClosetData, setActiveOrderOutofClosetData] = useState(
    []
  );
  const [activeOrderOutofClosetLimit, setActiveOrderOutofClosetLimit] =
    useState(2);
  const [
    activeOrderOutofClosetActivePage,
    setActiveOrderOutofClosetActivePage,
  ] = useState(1);
  const [activeOrderOutofClosetCount, setActiveOrderOutofClosetCount] =
    useState(0);
  const [isRedirect, setIsRedirect] = useState(false);
  const [cards, setCards] = useState([]);
  const [payoutAmount, setPayoutAmount] = useState(0);
  const [inProcessCount, setInProcessCount] = useState(0);
  const [walletDetails, setWalletDetails] = useState([]);
  const locationHistory = useLocation();

  const { authToken, user, userName, userid } = useSelector(
    ({ auth }) => ({
      authToken: auth.user.token,
      user: auth.user,
      userName: auth.user.first_name,
      userid: auth.user.id,
    }),
    shallowEqual
  );

  const dispatch = useDispatch();

  const history = useHistory();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    getUserProfileDetails();
    if (TabType === "Order_History") {
      fetchOrderHistroyIntoCloset();
      fetchOrderHistroyOutofCloset();
    }
    if (TabType === "Active_Orders") {
      fetchActiveOrderIntoCloset();
      fetchActiveOrderyOutofCloset();
    }
    if (TabType === "closet") {
      getMyRentals();
      getMyClothes();
    }
    if (TabType === "account") {
      getUserProfileDetails();
    }
  }, [
    TabType,
    orderIntoClosetActivePage,
    orderOutofClosetActivePage,
    activeOrderIntoClosetActivePage,
    activeOrderOutofClosetActivePage,
  ]);

  useEffect(() => {
    onTabClick(tabList.length - 4, "closet");
    getWalletDetailsHandler();
  }, []);

  useEffect(() => {
    if (locationHistory && locationHistory.state) {
      const { tabType } = locationHistory.state;
      if (tabType && tabType !== "") {
        if (tabType === "Order_History") {
          onTabClick(2, tabType);
        } else if (tabType === "Active_Orders") {
          onTabClick(1, tabType);
        }
      }
    }
  }, [locationHistory]);

  const onTabClick = (i, tabType) => {
    setTabType(tabType);
    setCurrentProduct({});
    setIsEdit(false);

    setProductManageView(false);
    tabList.map((item, index) => {
      if (index == i) {
        item.active = true;
      } else {
        item.active = false;
      }
      return item;
    });
  };

  const getWalletDetailsHandler = async () => {
    await getWalletDetails(authToken, userid).then((result) => {
      let amount = result?.data?.walletAmount.toFixed(2);
      setPayoutAmount(amount);
      setInProcessCount(result?.data?.inProcessCount);
      setWalletDetails(result?.data?.walletDetails);
    });
  };

  useEffect(() => {
    const offsetStart = (rentalActivePage - 1) * rentalLimit;
    const offsetEnd = rentalLimit;
    const orgD = [...rentalData];
    let data = orgD.splice(offsetStart, offsetEnd);
    setPaginatedRental(data);
  }, [rentalLimit, rentalActivePage]);

  useEffect(() => {
    const offsetStart = (myClothesActivePage - 1) * myClothesLimit;
    const offsetEnd = myClothesLimit;
    const orgD = [...myclothes];
    let data = orgD.splice(offsetStart, offsetEnd);
    setPaginatedMyClothes(data);
  }, [myClothesLimit, myClothesActivePage]);

  useEffect(() => {
    const offsetStart = (upcomingRentalActivePage - 1) * upcomingRentalLimit;
    const offsetEnd = upcomingRentalLimit;
    const orgD = [...productData];
    let data = orgD.splice(offsetStart, offsetEnd);
    setPaginatedUpcomingRental(data);
  }, [upcomingRentalLimit, upcomingRentalActivePage]);

  useEffect(() => {
    const offsetStart =
      (currentlyRotatedActivePage - 1) * currentlyRotatedLimit;
    const offsetEnd = currentlyRotatedLimit;
    const orgD = [...currentlyRotate];
    let data = orgD.splice(offsetStart, offsetEnd);
    setPaginatedCurrentlyRotated(data);
  }, [currentlyRotatedLimit, currentlyRotatedActivePage]);

  const fetchOrderHistroyIntoCloset = async () => {
    let intoMyCloset = 1;
    let isActiveOrders = 0;
    await orderHistroy(
      authToken,
      user.id,
      orderIntoClosetLimit,
      orderIntoClosetActivePage,
      intoMyCloset,
      isActiveOrders
    ).then((result) => {
      let resultsdata = [...result?.data?.postdata?.data];
      let tempArr = [];
      if (resultsdata?.length > 0) {
        resultsdata?.map((val) => {
          let OrderHistroyIn = { ...val };

          let total = OrderHistroyIn.OrderDetails[0].amount;

          let sellerCount = OrderHistroyIn?.order_data?.shippingCharges
            ?.sellerCount
            ? OrderHistroyIn.order_data?.shippingCharges?.sellerCount
            : 1;

          if (OrderHistroyIn?.shippingType === "shipping") {
            total +=
              OrderHistroyIn?.order_data?.shippingCharges?.rentalFee /
                sellerCount +
              OrderHistroyIn?.order_data?.shippingCharges?.shippingCharge /
                sellerCount +
              OrderHistroyIn?.order_data?.shippingCharges?.salesTax /
                sellerCount;
          } else {
            total +=
              OrderHistroyIn?.order_data?.shippingCharges?.rentalFee /
                sellerCount +
              OrderHistroyIn?.order_data?.shippingCharges?.salesTax /
                sellerCount;
          }
          OrderHistroyIn.total = total;
          tempArr.push(OrderHistroyIn);
        });
      }
      setOrderHistroyData([...tempArr]);
      setOrderIntoClosetCount(tempArr.length);
    });
  };

  const getMyRentals = async () => {
    await myRentals(authToken)
      .then((result) => {
        setRentalData(result.data.payload ? result.data.payload.data : []);
        let tempData = result.data.payload ? result.data.payload.data : [];
        if (tempData.length > 0) {
          let d = [...result.data.payload?.data];
          const offsetStart = (rentalActivePage - 1) * rentalLimit;
          d = d.splice(offsetStart, rentalLimit);
          setPaginatedRental(d);
        }
      })
      .catch((errors) => {
        let error_status = errors.response.status;
        if (error_status === 401) {
          dispatch(dispatchLogout());
          history.push("/account/login");
        }
        setPaginatedRental([]);
        // showToast("error", errors);
      });
  };

  const getMyClothes = async () => {
    await myClothes(authToken)
      .then((result) => {
        setMyClothes(result.data.payload ? result.data.payload.data : []);
        let tempData = result.data.payload ? result.data.payload.data : [];
        if (tempData.length > 0) {
          let d = [...result.data.payload?.data];
          const offsetStart = (myClothesActivePage - 1) * myClothesLimit;
          d = d.splice(offsetStart, myClothesLimit);
          setPaginatedMyClothes(d);
        }
      })
      .catch((errors) => {
        let error_status = errors.response.status;
        if (error_status !== 401) {
          // showToast("error", errors);
          setPaginatedMyClothes([]);
        }
      });
  };

  const getUserProfileDetails = async () => {
    await getUserProfile(authToken, userid)
      .then((result) => {
        setUserProfile(result.data.payload ? result.data.payload.data : {});
        setShippingAddress(
          result.data.payload
            ? result.data.payload.data &&
                result.data.payload.data.ShippingAddress
            : []
        );
      })
      .catch((errors) => {
        let error_status = errors.response.status;
        if (error_status !== 401) {
          // showToast("error", errors);
        }
      });
  };

  const handleChange = (key, value, index) => {
    if (key === "sortBy") {
      setSortBy(value);
      setShowModal(true);
    }
  };

  const onProductClick = (item) => {
    history.push({
      pathname: "/listing-details",
      state: { productDetails: item.id, isEditMode: true, onPage: false },
    });
  };

  const handleWarningModal = () => {
    setWarningModal(true);
    setShowModal(true);
  };

  const handleRedirect = () => {
    setShowModal(false);
    onTabClick(tabList.length - 1, "account");
    if (shippingAddress.length === 0) {
      setIsRedirect(true);
    }
  };

  const orderDetails = (id, subType) => {
    history.push({
      pathname: "/order-details",
      state: { orderId: id, type: TabType, subType },
    });
  };

  const renderTabBody = () => {
    if (TabType == "closet") {
      return (
        <>
          {!productManageView ? (
            <>
              <div className="row">
                <div className="col-12 col-lg-8">
                  <h1 className="text-black-3 font-CambonRegular font-26 text-uppercase">
                    My Clothes
                  </h1>
                </div>
                {!productManageView && (
                  <div className="col-12 col-lg-4 text-end">
                    <div className="dropdown sortby">
                      <a
                        className="font-16 font-14-mobile text-black text-decoration-none text-black font-InterLight dropdown-toggle cursor-pointer"
                        id="sotyBy"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        Quick Action <ExpandMore />{" "}
                      </a>
                      <ul
                        className="dropdown-menu py-0"
                        aria-labelledby="sotyBy"
                      >
                        <li>
                          <a
                            className="dropdown-item text-black-3 font-InterLight cursor-pointer"
                            onClick={() => {
                              handleChange("sortBy", 0);
                            }}
                          >
                            Deactivate all items{" "}
                            {sortBy === 0 && (
                              <img
                                src="/media/images/check.png"
                                className={clsx(
                                  "img-fluid sortby-check",
                                  sortBy != 0 && "d-none"
                                )}
                              />
                            )}
                          </a>
                        </li>
                        <li>
                          <a
                            className="dropdown-item text-black-3 font-InterLight cursor-pointer"
                            onClick={() => {
                              handleChange("sortBy", 1);
                            }}
                          >
                            Activate all items{" "}
                            {sortBy === 0 && (
                              <img
                                src="/media/images/check.png"
                                className={clsx(
                                  "img-fluid sortby-check",
                                  sortBy != 1 && "d-none"
                                )}
                              />
                            )}
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                <div className="col-12 col-md-6 col-lg-4 col-xl-3 mt-4">
                  <img
                    src="/media/images/list2.png"
                    className="d-block mx-auto cursor-pointer add-product-img-style"
                    onClick={() => {
                      if (shippingAddress.length === 0) {
                        handleWarningModal();
                      } else {
                        history.push({ pathname: "/listing-details" });
                        setProductManageView(true);
                        setCurrentProduct({});
                        setIsEdit(false);
                      }
                    }}
                  />
                </div>

                {myclothes.length > 0 && (
                  <>
                    {paginatedMyClothes.map((item, index) => (
                      <div
                        className="col-12 col-md-6 col-lg-4 col-xl-3 mt-4"
                        key={index}
                      >
                        <SingleProduct
                          productData={item}
                          showActiveIcon={true}
                          img={item.ProductImages[0]?.image_url}
                          title={item.title}
                          price={item?.rental_fee["2weeks"]}
                          onClick={() => onProductClick(item)}
                          isOwner={true}
                        />
                      </div>
                    ))}

                    {myclothes.length > 0 && (
                      <div className="d-flex justify-content-center align-items-center py-5 cus-pagination">
                        <Pagination
                          className="pagination-bar"
                          currentPage={myClothesActivePage}
                          totalCount={myclothes.length}
                          pageSize={myClothesLimit}
                          onPageChange={(page) => setMyClothesActivePage(page)}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          ) : (
            <AddProduct isEdit={isEdit} currentProduct={currentProduct} />
          )}
        </>
      );
    } else if (TabType == "Active_Orders") {
      return (
        <>
          <div className="row account-accordion">
            <div className="col-12">
              <Accordion defaultExpanded>
                <AccordionSummary
                  expandIcon={<ExpandMore className="text-black" />}
                >
                  <Typography>
                    <h1 className="text-black-3 font-CambonRegular font-26 text-uppercase">
                      Rented out of my closet
                    </h1>
                    <p className="text-black-3 font-InterRegular font-18 text-uppercase mt-4 mb-0">
                      {activeOrderOutofClosetCount} orders
                    </p>
                  </Typography>
                </AccordionSummary>
                {activeOrderyOutofClosetData &&
                activeOrderyOutofClosetData.length > 0
                  ? activeOrderyOutofClosetData.map((val) => (
                      <AccordionDetails>
                        <Typography>
                          <div className="row border-slate-gray br-10 px-2 py-3 mb-3">
                            <div className="col-12">
                              {val.shippingType === "shipping" ? (
                                [0, 2].includes(
                                  val.OrderDetails[0].shipping_status
                                ) ? (
                                  <p className="text-black-3 font-InterMedium font-18 mb-2">
                                    Ship by{" "}
                                    {moment(val.OrderDetails[0].start_date)
                                      .subtract(4, "days")
                                      .format("dddd")}
                                    ,{" "}
                                    {moment(val.OrderDetails[0].start_date)
                                      .subtract(4, "days")
                                      .format("MMMM")
                                      .substring(0, 3)}{" "}
                                    {moment(val.OrderDetails[0].start_date)
                                      .subtract(4, "days")
                                      .format("DD")}{" "}
                                    {moment(val.OrderDetails[0].start_date)
                                      .subtract(4, "days")
                                      .format("yyyy")}
                                  </p>
                                ) : (
                                  <p className="text-black-3 font-InterMedium font-18 mb-2">
                                    Expected return by{" "}
                                    {moment(val.OrderDetails[0].end_date)
                                      .add(7, "days")
                                      .format("dddd")}
                                    ,{" "}
                                    {moment(val.OrderDetails[0].end_date)
                                      .add(7, "days")
                                      .format("MMMM")
                                      .substring(0, 3)}{" "}
                                    {moment(val.OrderDetails[0].end_date)
                                      .add(7, "days")
                                      .format("DD")}{" "}
                                    {moment(val.OrderDetails[0].end_date)
                                      .add(7, "days")
                                      .format("yyyy")}
                                  </p>
                                )
                              ) : [0, 7].includes(
                                  val.OrderDetails[0].shipping_status
                                ) ? (
                                <p className="text-black-3 font-InterMedium font-18 mb-2">
                                  Estimated pickup date{" "}
                                  {moment(val.OrderDetails[0].start_date)
                                    .subtract(1, "days")
                                    .format("dddd")}
                                  ,{" "}
                                  {moment(val.OrderDetails[0].start_date)
                                    .subtract(1, "days")
                                    .format("MMMM")
                                    .substring(0, 3)}{" "}
                                  {moment(val.OrderDetails[0].start_date)
                                    .subtract(1, "days")
                                    .format("DD")}{" "}
                                  {moment(val.OrderDetails[0].start_date)
                                    .subtract(1, "days")
                                    .format("yyyy")}
                                </p>
                              ) : (
                                <p className="text-black-3 font-InterMedium font-18 mb-2">
                                  Return due by{" "}
                                  {moment(val.OrderDetails[0].end_date).format(
                                    "dddd"
                                  )}
                                  ,{" "}
                                  {moment(val.OrderDetails[0].end_date)
                                    .format("MMMM")
                                    .substring(0, 3)}{" "}
                                  {moment(val.OrderDetails[0].end_date).format(
                                    "DD"
                                  )}{" "}
                                  {moment(val.OrderDetails[0].end_date).format(
                                    "yyyy"
                                  )}
                                </p>
                              )}
                            </div>
                            <div className="col-12 col-md-5 col-lg-4 col-xl-3">
                              <p className="text-black-3 font-InterLight font-18 mb-0">
                                Dates
                              </p>
                              <p className="text-black-3 font-InterLight font-18">
                                {moment(val.OrderDetails[0].start_date).format(
                                  "MM/DD/YYYY"
                                )}{" "}
                                &nbsp;-&nbsp;{" "}
                                {moment(val.OrderDetails[0].end_date).format(
                                  "MM/DD/YYYY"
                                )}
                              </p>
                              <p className="text-black-3 font-InterLight font-18 mb-0">
                                Order number
                              </p>
                              <p className="text-black-3 font-InterLight font-18 mb-0">
                                {val.id}
                              </p>
                            </div>
                            <div className="col-12 col-md-7 col-lg-8 col-xl-7 mt-3 mt-md-0">
                              <div className="d-flex flex-wrap align-items-center">
                                {val.OrderDetails.length > 0 &&
                                  val.OrderDetails.map((inVal) => (
                                    <div className="mx-1 mt-2">
                                      <img
                                        src={inVal.image_url}
                                        className="max-w-150 rounded"
                                      />
                                    </div>
                                  ))}
                              </div>
                            </div>
                            <div className="col-12 col-xl-2 d-flex align-items-end justify-content-end mt-3 mt-xl-0">
                              <a
                                className="text-brown font-18 font-InterRegular text-uppercase cursor-pointer"
                                onClick={() =>
                                  orderDetails(val.id, "RentedOutOfMyCloset")
                                }
                              >
                                Order details
                              </a>
                            </div>
                          </div>
                        </Typography>
                      </AccordionDetails>
                    ))
                  : "No Order History Found."}
                {TabType == "Active_Orders" &&
                  activeOrderOutofClosetCount > 0 && (
                    <div className="d-flex justify-content-center align-items-center py-5 cus-pagination">
                      <Pagination
                        className="pagination-bar"
                        currentPage={activeOrderOutofClosetActivePage}
                        totalCount={activeOrderOutofClosetCount}
                        pageSize={activeOrderOutofClosetLimit}
                        onPageChange={(page) =>
                          setActiveOrderOutofClosetActivePage(page)
                        }
                        productDetailed={true}
                      />
                    </div>
                  )}
              </Accordion>
            </div>

            <div className="col-12 mt-5">
              <Accordion defaultExpanded>
                <AccordionSummary
                  expandIcon={<ExpandMore className="text-black" />}
                >
                  <Typography>
                    <h1 className="text-black-3 font-CambonRegular font-26 text-uppercase">
                      Rented into my closet
                    </h1>
                    <p className="text-black-3 font-InterRegular font-18 text-uppercase mt-4 mb-0">
                      {activeOrderIntoClosetCount} orders
                    </p>
                  </Typography>
                </AccordionSummary>
                {activeOrderData && activeOrderData.length > 0
                  ? activeOrderData.map((val) => (
                      <AccordionDetails>
                        <Typography>
                          <div className="row border-slate-gray br-10 px-2 py-3 mb-3">
                            <div className="col-12">
                              {val.shippingType === "shipping" ? (
                                [0, 2].includes(
                                  val.OrderDetails[0].shipping_status
                                ) ? (
                                  <p className="text-black-3 font-InterMedium font-18 mb-2">
                                    Estimated delivery{" "}
                                    {moment(
                                      val.OrderDetails[0].start_date
                                    ).format("dddd")}
                                    ,{" "}
                                    {moment(
                                      val.OrderDetails[0].start_date
                                    ).format("DD")}{" "}
                                    {moment(val.OrderDetails[0].start_date)
                                      .format("MMMM")
                                      .substring(0, 3)}{" "}
                                    {moment(
                                      val.OrderDetails[0].start_date
                                    ).format("yyyy")}
                                  </p>
                                ) : (
                                  <p className="text-black-3 font-InterMedium font-18 mb-2">
                                    Ship by{" "}
                                    {moment(
                                      val.OrderDetails[0].end_date
                                    ).format("dddd")}
                                    ,{" "}
                                    {moment(
                                      val.OrderDetails[0].end_date
                                    ).format("DD")}{" "}
                                    {moment(val.OrderDetails[0].end_date)
                                      .format("MMMM")
                                      .substring(0, 3)}{" "}
                                    {moment(
                                      val.OrderDetails[0].end_date
                                    ).format("yyyy")}
                                  </p>
                                )
                              ) : [0, 7].includes(
                                  val.OrderDetails[0].shipping_status
                                ) ? (
                                <p className="text-black-3 font-InterMedium font-18 mb-2">
                                  Pick up on{" "}
                                  {moment(val.OrderDetails[0].start_date)
                                    .subtract(1, "days")
                                    .format("dddd")}
                                  ,{" "}
                                  {moment(val.OrderDetails[0].start_date)
                                    .subtract(1, "days")
                                    .format("DD")}{" "}
                                  {moment(val.OrderDetails[0].start_date)
                                    .subtract(1, "days")
                                    .format("MMMM")
                                    .substring(0, 3)}{" "}
                                  {moment(val.OrderDetails[0].start_date)
                                    .subtract(1, "days")
                                    .format("yyyy")}
                                </p>
                              ) : (
                                <p className="text-black-3 font-InterMedium font-18 mb-2">
                                  Drop off by{" "}
                                  {moment(val.OrderDetails[0].end_date).format(
                                    "dddd"
                                  )}
                                  ,{" "}
                                  {moment(val.OrderDetails[0].end_date).format(
                                    "DD"
                                  )}{" "}
                                  {moment(val.OrderDetails[0].end_date)
                                    .format("MMMM")
                                    .substring(0, 3)}{" "}
                                  {moment(val.OrderDetails[0].end_date).format(
                                    "yyyy"
                                  )}
                                </p>
                              )}
                            </div>
                            <div className="col-12 col-md-5 col-lg-4 col-xl-3">
                              <p className="text-black-3 font-InterLight font-18 mb-0">
                                Dates
                              </p>
                              <p className="text-black-3 font-InterLight font-18">
                                {moment(val.OrderDetails[0].start_date).format(
                                  "MM/DD/YYYY"
                                )}{" "}
                                &nbsp;-&nbsp;{" "}
                                {moment(val.OrderDetails[0].end_date).format(
                                  "MM/DD/YYYY"
                                )}
                              </p>
                              <p className="text-black-3 font-InterLight font-18 mb-0">
                                Order number
                              </p>
                              <p className="text-black-3 font-InterLight font-18 mb-0">
                                {val.id}
                              </p>
                            </div>
                            <div className="col-12 col-md-7 col-lg-8 col-xl-7 mt-3 mt-md-0">
                              <div className="d-flex flex-wrap align-items-center">
                                {val.OrderDetails.length > 0 &&
                                  val.OrderDetails.map((inVal) => (
                                    <div className="mx-1 mt-2">
                                      <img
                                        src={inVal.image_url}
                                        className="max-w-150 rounded"
                                      />
                                    </div>
                                  ))}
                              </div>
                            </div>
                            <div className="col-12 col-xl-2 d-flex align-items-end justify-content-end mt-3 mt-xl-0">
                              <a
                                className="text-brown font-18 font-InterRegular text-uppercase cursor-pointer"
                                onClick={() =>
                                  orderDetails(val.id, "RentedIntoMyCloset")
                                }
                              >
                                Order details
                              </a>
                            </div>
                          </div>
                        </Typography>
                      </AccordionDetails>
                    ))
                  : "No Order History Found."}
                {TabType == "Active_Orders" &&
                  activeOrderIntoClosetCount > 0 && (
                    <div className="d-flex justify-content-center align-items-center py-5 cus-pagination">
                      <Pagination
                        className="pagination-bar"
                        currentPage={activeOrderIntoClosetActivePage}
                        totalCount={activeOrderIntoClosetCount}
                        pageSize={activeOrderIntoClosetLimit}
                        onPageChange={(page) =>
                          setActiveOrderIntoClosetActivePage(page)
                        }
                        productDetailed={true}
                      />
                    </div>
                  )}
              </Accordion>
            </div>
          </div>
        </>
      );
    } else if (TabType == "Order_History") {
      return (
        <>
          <div className="row account-accordion">
            <div className="col-12 mb-2">
              <h1 className="text-black-3 font-CambonRegular font-26 text-uppercase">
                Order history
              </h1>
            </div>
            <div className="col-12">
              <Accordion defaultExpanded>
                <AccordionSummary
                  expandIcon={<ExpandMore className="text-black" />}
                >
                  <Typography>
                    <h1 className="text-black-3 font-CambonRegular font-26 text-uppercase">
                      Rented out of my closet
                    </h1>
                    <p className="text-black-3 font-InterRegular font-18 text-uppercase mt-4 mb-0">
                      {orderOutofClosetCount} orders
                    </p>
                  </Typography>
                </AccordionSummary>
                {orderHistoryOutofClosetData &&
                orderHistoryOutofClosetData.length > 0
                  ? orderHistoryOutofClosetData.map((val) => (
                      <AccordionDetails>
                        <Typography>
                          <div className="row border-slate-gray br-10 px-2 py-3 mb-3">
                            <div className="col-12">
                              {val.shippingType === "shipping" ? (
                                [0, 2].includes(
                                  val.OrderDetails[0].shipping_status
                                ) ? (
                                  <p className="text-black-3 font-InterMedium font-18 mb-2">
                                    Ship by{" "}
                                    {moment(val.OrderDetails[0].start_date)
                                      .subtract(4, "days")
                                      .format("dddd")}
                                    ,{" "}
                                    {moment(val.OrderDetails[0].start_date)
                                      .subtract(4, "days")
                                      .format("DD")}{" "}
                                    {moment(val.OrderDetails[0].start_date)
                                      .subtract(4, "days")
                                      .format("MMMM")
                                      .substring(0, 3)}{" "}
                                    {moment(val.OrderDetails[0].start_date)
                                      .subtract(4, "days")
                                      .format("yyyy")}
                                  </p>
                                ) : (
                                  <p className="text-black-3 font-InterMedium font-18 mb-2">
                                    Expected return by{" "}
                                    {moment(val.OrderDetails[0].end_date)
                                      .add(7, "days")
                                      .format("dddd")}
                                    ,{" "}
                                    {moment(val.OrderDetails[0].end_date)
                                      .add(7, "days")
                                      .format("DD")}{" "}
                                    {moment(val.OrderDetails[0].end_date)
                                      .add(7, "days")
                                      .format("MMMM")
                                      .substring(0, 3)}{" "}
                                    {moment(val.OrderDetails[0].end_date)
                                      .add(7, "days")
                                      .format("yyyy")}
                                  </p>
                                )
                              ) : [0, 7].includes(
                                  val.OrderDetails[0].shipping_status
                                ) ? (
                                <p className="text-black-3 font-InterMedium font-18 mb-2">
                                  Estimated pickup date{" "}
                                  {moment(val.OrderDetails[0].start_date)
                                    .subtract(1, "days")
                                    .format("dddd")}
                                  ,{" "}
                                  {moment(val.OrderDetails[0].start_date)
                                    .subtract(1, "days")
                                    .format("DD")}{" "}
                                  {moment(val.OrderDetails[0].start_date)
                                    .subtract(1, "days")
                                    .format("MMMM")
                                    .substring(0, 3)}{" "}
                                  {moment(val.OrderDetails[0].start_date)
                                    .subtract(1, "days")
                                    .format("yyyy")}
                                </p>
                              ) : (
                                <p className="text-black-3 font-InterMedium font-18 mb-2">
                                  Return due by{" "}
                                  {moment(val.OrderDetails[0].end_date).format(
                                    "dddd"
                                  )}
                                  ,{" "}
                                  {moment(val.OrderDetails[0].end_date).format(
                                    "DD"
                                  )}{" "}
                                  {moment(val.OrderDetails[0].end_date)
                                    .format("MMMM")
                                    .substring(0, 3)}{" "}
                                  {moment(val.OrderDetails[0].end_date).format(
                                    "yyyy"
                                  )}
                                </p>
                              )}
                            </div>
                            <div className="col-12 col-md-5 col-lg-4 col-xl-3">
                              <p className="text-black-3 font-InterLight font-18 mb-0">
                                Dates
                              </p>
                              <p className="text-black-3 font-InterLight font-18">
                                {moment(val.OrderDetails[0].start_date).format(
                                  "MM/DD/YYYY"
                                )}{" "}
                                &nbsp;-&nbsp;{" "}
                                {moment(val.OrderDetails[0].end_date).format(
                                  "MM/DD/YYYY"
                                )}
                              </p>
                              <p className="text-black-3 font-InterLight font-18 mb-0">
                                Order number
                              </p>
                              <p className="text-black-3 font-InterLight font-18">
                                {val.id}
                              </p>
                              <p className="text-black-3 font-InterLight font-18 mb-0">
                                Total Earning
                              </p>
                              <p className="text-black-3 font-InterLight font-18 mb-0">
                                ${val.total}
                              </p>
                            </div>
                            <div className="col-12 col-md-7 col-lg-8 col-xl-7 mt-3 mt-md-0">
                              <div className="d-flex flex-wrap align-items-center">
                                {val.OrderDetails.length > 0 &&
                                  val.OrderDetails.map((inVal) => (
                                    <div className="mx-1 mt-2">
                                      <img
                                        src={inVal.image_url}
                                        className="max-w-150 rounded"
                                      />
                                    </div>
                                  ))}
                              </div>
                            </div>
                            <div className="col-12 col-xl-2 d-flex align-items-end justify-content-end mt-3 mt-xl-0">
                              <a
                                className="text-brown font-18 font-InterRegular text-uppercase cursor-pointer"
                                onClick={() =>
                                  orderDetails(val.id, "RentedOutOfMyCloset")
                                }
                              >
                                Order details
                              </a>
                            </div>
                          </div>
                        </Typography>
                      </AccordionDetails>
                    ))
                  : "No Order History Found."}
                {TabType == "Order_History" && orderOutofClosetCount > 0 && (
                  <div className="d-flex justify-content-center align-items-center py-5 cus-pagination">
                    <Pagination
                      className="pagination-bar"
                      currentPage={orderOutofClosetActivePage}
                      totalCount={orderOutofClosetCount}
                      pageSize={orderOutofClosetLimit}
                      onPageChange={(page) =>
                        setOrderOutofClosetActivePage(page)
                      }
                      productDetailed={true}
                    />
                  </div>
                )}
              </Accordion>
            </div>

            <div className="col-12 mt-5">
              <Accordion defaultExpanded>
                <AccordionSummary
                  expandIcon={<ExpandMore className="text-black" />}
                >
                  <Typography>
                    <h1 className="text-black-3 font-CambonRegular font-26 text-uppercase">
                      Rented into my closet
                    </h1>
                    <p className="text-black-3 font-InterRegular font-18 text-uppercase mt-4 mb-0">
                      {orderIntoClosetCount} orders
                    </p>
                  </Typography>
                </AccordionSummary>
                {orderHistoryData && orderHistoryData.length > 0
                  ? orderHistoryData.map((val) => (
                      <AccordionDetails>
                        <Typography>
                          <div className="row border-slate-gray br-10 px-2 py-3 mb-3">
                            <div className="col-12">
                              {val.shippingType === "shipping" ? (
                                [0, 2].includes(
                                  val.OrderDetails[0].shipping_status
                                ) ? (
                                  <p className="text-black-3 font-InterMedium font-18 mb-2">
                                    Estimated delivery{" "}
                                    {moment(
                                      val.OrderDetails[0].start_date
                                    ).format("dddd")}
                                    ,{" "}
                                    {moment(
                                      val.OrderDetails[0].start_date
                                    ).format("DD")}{" "}
                                    {moment(val.OrderDetails[0].start_date)
                                      .format("MMMM")
                                      .substring(0, 3)}{" "}
                                    {moment(
                                      val.OrderDetails[0].start_date
                                    ).format("yyyy")}
                                  </p>
                                ) : (
                                  <p className="text-black-3 font-InterMedium font-18 mb-2">
                                    Ship by{" "}
                                    {moment(
                                      val.OrderDetails[0].end_date
                                    ).format("dddd")}
                                    ,{" "}
                                    {moment(
                                      val.OrderDetails[0].end_date
                                    ).format("DD")}{" "}
                                    {moment(val.OrderDetails[0].end_date)
                                      .format("MMMM")
                                      .substring(0, 3)}{" "}
                                    {moment(
                                      val.OrderDetails[0].end_date
                                    ).format("yyyy")}
                                  </p>
                                )
                              ) : [0, 7].includes(
                                  val.OrderDetails[0].shipping_status
                                ) ? (
                                <p className="text-black-3 font-InterMedium font-18 mb-2">
                                  Pick up on{" "}
                                  {moment(val.OrderDetails[0].start_date)
                                    .subtract(1, "days")
                                    .format("dddd")}
                                  ,{" "}
                                  {moment(val.OrderDetails[0].start_date)
                                    .subtract(1, "days")
                                    .format("DD")}{" "}
                                  {moment(val.OrderDetails[0].start_date)
                                    .subtract(1, "days")
                                    .format("MMMM")
                                    .substring(0, 3)}{" "}
                                  {moment(val.OrderDetails[0].start_date)
                                    .subtract(1, "days")
                                    .format("yyyy")}
                                </p>
                              ) : (
                                <p className="text-black-3 font-InterMedium font-18 mb-2">
                                  Drop off by{" "}
                                  {moment(val.OrderDetails[0].end_date).format(
                                    "dddd"
                                  )}
                                  ,{" "}
                                  {moment(val.OrderDetails[0].end_date).format(
                                    "DD"
                                  )}{" "}
                                  {moment(val.OrderDetails[0].end_date)
                                    .format("MMMM")
                                    .substring(0, 3)}{" "}
                                  {moment(val.OrderDetails[0].end_date).format(
                                    "yyyy"
                                  )}
                                </p>
                              )}
                            </div>
                            <div className="col-12 col-md-5 col-lg-4 col-xl-3">
                              <p className="text-black-3 font-InterLight font-18 mb-0">
                                Dates
                              </p>
                              <p className="text-black-3 font-InterLight font-18">
                                {moment(val.OrderDetails[0].start_date).format(
                                  "MM/DD/YYYY"
                                )}{" "}
                                &nbsp;-&nbsp;{" "}
                                {moment(val.OrderDetails[0].end_date).format(
                                  "MM/DD/YYYY"
                                )}
                              </p>
                              <p className="text-black-3 font-InterLight font-18 mb-0">
                                Order number
                              </p>
                              <p className="text-black-3 font-InterLight font-18">
                                {val.id}
                              </p>
                              <p className="text-black-3 font-InterLight font-18 mb-0">
                                Order Total
                              </p>
                              <p className="text-black-3 font-InterLight font-18 mb-0">
                                ${val.total}
                              </p>
                            </div>
                            <div className="col-12 col-md-7 col-lg-8 col-xl-7 mt-3 mt-md-0">
                              <div className="d-flex flex-wrap align-items-center">
                                {val.OrderDetails.length > 0 &&
                                  val.OrderDetails.map((inVal) => (
                                    <div className="mx-1 mt-2">
                                      <img
                                        src={inVal.image_url}
                                        className="max-w-150 rounded"
                                      />
                                    </div>
                                  ))}
                              </div>
                            </div>
                            <div className="col-12 col-xl-2 d-flex align-items-end justify-content-end mt-3 mt-xl-0">
                              <a
                                className="text-brown font-18 font-InterRegular text-uppercase cursor-pointer"
                                onClick={() =>
                                  orderDetails(val.id, "RentedIntoMyCloset")
                                }
                              >
                                Order details
                              </a>
                            </div>
                          </div>
                        </Typography>
                      </AccordionDetails>
                    ))
                  : "No Order History Found."}
                {TabType == "Order_History" && orderIntoClosetCount > 0 && (
                  <div className="d-flex justify-content-center align-items-center py-5 cus-pagination">
                    <Pagination
                      className="pagination-bar"
                      currentPage={orderIntoClosetActivePage}
                      totalCount={orderIntoClosetCount}
                      pageSize={orderIntoClosetLimit}
                      onPageChange={(page) =>
                        setOrderIntoClosetActivePage(page)
                      }
                      productDetailed={true}
                    />
                  </div>
                )}
              </Accordion>
            </div>
          </div>
        </>
      );
    } else if (TabType == "account") {
      return (
        <Account
          isRedirect={isRedirect}
          payoutAmount={payoutAmount}
          inProcessCount={inProcessCount}
          walletDetails={walletDetails}
          getWalletDetailsHandler={getWalletDetailsHandler}
        />
      );
    }
  };

  return (
    <section className="bg-light-gray">
      <TitleComponent title={props.title} icon={props.icon} />
      <div className="container">
        <div className="row align-items-center py-4 px-2 px-md-0">
          <div className="col-12 col-lg-8">
            <h1 className="text-brown font-CambonRegular font-35 text-uppercase mb-0 line-before">
              Welcome to your closet, {userName}{" "}
            </h1>
          </div>
          <div className="col-12 col-lg-4 mt-3 mt-lg-0 text-lg-end">
            <h1 className="text-black-3 font-InterRegular font-30 text-uppercase mb-0">
              <img src="/media/images/wallet.png" className="img-fluid" /> $
              {payoutAmount}
            </h1>
          </div>
        </div>
        <div className="row justify-content-center mt-3 px-2 px-md-0">
          <div className="col-12">
            <div className="d-flex flex-column flex-md-row align-items-md-center border-slate-gray-bottom">
              {tabList?.map((item, index) => (
                <div
                  className={clsx(
                    index == 0 ? "pe-md-4 pe-lg-5" : "px-md-4 px-lg-5"
                  )}
                  key={index}
                >
                  <h1
                    className={clsx(
                      "font-16 font-InterRegular cursor-pointer mb-md-0 pb-md-2",
                      item.active == true
                        ? "text-brown border-cream-bottom"
                        : "text-black"
                    )}
                    onClick={() => onTabClick(index, item.tabType)}
                  >
                    {" "}
                    {item.name}{" "}
                  </h1>
                </div>
              ))}
            </div>
          </div>

          <div className="col-12">
            <div className="pt-4 pb-5 mb-5">{renderTabBody()}</div>
          </div>
        </div>
      </div>

      <Modal
        centered="true"
        size="lg"
        show={showModal}
        onHide={() => {
          setShowModal(false);
        }}
        style={{ opacity: 1 }}
      >
        {showModal && renderModalBody()}
      </Modal>
    </section>
  );
};

import React, {
    Component
} from 'react';
import {
    Grid,
    Typography,
    Card,
    Paper,
    Button,
    Badge,
    Divider,
} from '@material-ui/core';
import CardActions from '@material-ui/core/CardActions';
import icon from '../../assets/img/icon-34.png';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import "./userinfo_page.css";
import NameCard from '../modules/name_card';
import MyProductCard from '../modules/my_product_card';
import FriendRequestCard from '../modules/friend_request_card';
import FriendCard from '../modules/friend_card';


class UserInfoPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user_id: this.props.user_id,
            bought_product_list: [],
            liked_product_list: [],
            friends_list: [],
            received_friend_requests: [],
            num_friend_requests: 0,
            show_collection_bought: false,
            show_collection_liked: false,
            show_friends: false,
        }
        console.log(this.state);
    }

    handleUpdateSelf = (data) => {
        this.setState({
            user_name: data.user_name,
            profile_img: data.profile_img,
        })
        console.log("updated self: ", this.state);
    }

    handleUpdate = (name, value) => { //[name of variable]: value of variable
        this.setState({ [name]: value, });
        console.log("Update state-> ", this.state);
    }


    componentDidMount = () => {
        (function (i, s, o, g, r, a, m) {
            i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function () {
                (i[r].q = i[r].q || []).push(arguments)
            }, i[r].l = 1 * new Date(); a = s.createElement(o),
                m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)
        })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');
        ga('create', 'UA-184044017-1', 'auto');
        ga('set', 'checkProtocolTask', null);
        ga('send', 'pageview', "userinfo_page");

        const handleUpdate = this.handleUpdate;
        chrome.runtime.sendMessage({ type: "onLoadUserBoughtProductList" },
            function (res) {
                console.log('Userinfo Page receives reply from background for onLoadUserBoughtProductList ', res.data);
                if (res.status === 200) {
                    console.log("onLoadUserBoughtProductList succeeded.");
                    handleUpdate("bought_product_list", res.data.bought_product_list);
                }
                else {
                    console.error(res.data + ", onLoadSelfProductList failed.");
                }
            }
        );
        chrome.runtime.sendMessage({ type: "onLoadUserLikedProductList" },
            function (res) {
                console.log('Userinfo receives reply from background for onLoadUserLikedProductList ', res.data);
                if (res.status === 200) {
                    console.log("onLoadUserLikedProductList succeeded.");
                    handleUpdate("liked_product_list", res.data.liked_product_list);
                }
                else {
                    console.error(res.data + ", onLoadUserLikedProductList failed.");
                }
            }
        );
        // to show the friends requests. 
        chrome.runtime.sendMessage({ type: "onLoadFriendRequestsList" },
            function (res) {
                console.log('Userinfo receives reply from background for onLoadFriendRequestsList ', res.data);
                if (res.status === 200) {
                    console.log("onLoadFriendsList succeeded.");
                    handleUpdate("received_friend_requests", res.data.received_friend_requests);
                    handleUpdate("num_friend_requests", res.data.received_friend_requests.length);

                    this.props.onUpdateNumFriendRequests(res.data.received_friend_requests.length);
                }
                else {
                    console.error(res.data + ", onLoadFriendRequestsList failed.");
                }
            }
        );

        chrome.runtime.sendMessage({ type: "onLoadFriendsList" },
            function (res) {
                console.log('Userinfo eceives reply from background for onLoadFriendsList ', res.data);
                if (res.status === 200) {
                    console.log("onLoadFriendsList succeeded.");
                    handleUpdate("friends_list", res.data.friends_list);
                }
                else {
                    console.error(res.data + ", onLoadUserBoughtProductList failed.");
                }
            }
        );

    }


    onDeleteBoughtProduct = (product_id) => {
        console.log("product to be delete has id", product_id);
        let new_bought_product_list = this.state.bought_product_list.filter(item => item['_id'] !== product_id);

        this.setState({
            bought_product_list: new_bought_product_list,
        });
        chrome.runtime.sendMessage({ type: "onDeleteSelfBoughtProduct", data: product_id },
            function (res) {
                console.log('Userinfo     receives reply from background for onDeleteSelfBoughtProduct ', res.data);
                if (res.status === 200) {
                    console.log("onDeleteSelfBoughtProduct succeeded.");
                }
                else {
                    console.error(res.data + ", onDeleteSelfBoughtProduct failed.");
                }
            }
        );
    }

    onDeleteLikedProduct = (product_id) => {
        console.log("product to be delete has id", product_id);
        let new_liked_product_list = this.state.liked_product_list.filter(item => item['_id'] !== product_id);
        this.setState({
            liked_product_list: new_liked_product_list,
        });
        chrome.runtime.sendMessage({ type: "onDeleteSelfLikedProduct", data: { "product_id": product_id } },
            function (res) {
                console.log('Userinfo     receives reply from background for onDeleteSelfLikedProduct', res.data);
                if (res.status === 200) {
                    console.log("onDeleteSelfLikedProduct succeeded.");
                }
                else {
                    console.error(res.data + ", onDeleteSelfLikedProduct failed.");
                }
            }
        );
    }

    onClickCollectionShowBought = () => {
        ga('send', 'event', "Userinfo_UIButton", 'Click', "CollectionShowBought");
        this.setState({
            show_collection_bought: !this.state.show_collection_bought
        })
    }

    onShowClickCollectionLikedButton = () => {
        ga('send', 'event', "Userinfo_UIButton", 'Click', "CollectionShowLiked");
        this.setState({
            show_collection_liked: !this.state.show_collection_liked
        })
    }

    onClickShowFriendsButton = () => {
        ga('send', 'event', "Userinfo_UIButton", 'Click', "ShowFriends");
        this.setState({
            show_friends: !this.state.show_friends
        })
    }

    onUpdateFriendRequestStatus = () => {
        ga('send', 'event', "Userinfo_UIButton", 'Click', "FriendRequest");

        this.props.onUpdateNumFriendRequests(this.state.num_friend_requests - 1);
        this.setState({
            num_friend_requests: this.state.num_friend_requests - 1
        });
        console.log("userinfo updates friend request status: ", this.state.num_friend_requests);
    }

    onClickApp() {
        ga('send', 'event', "Userinfo_UIButton", 'Click', "AppHomePage");
        console.log("onClickApp");
        chrome.runtime.sendMessage({ type: "onClickApp" },
            function (res) {
                console.log("Page opened for tastemaker app: ", res);
            }
        );
    }

    render() {
        return (
            <Grid container spacing={0} alignItems="center" style={{ margin: 0, padding: 0 }}>
                <Grid item xs={2}>
                    <img src={icon} alt="extension icon" width="25px" />
                </Grid>
                <Grid item xs={4}>
                    <Button onClick={this.onClickApp} style={{ textTransform: "none", textDecoration: "underline", fontSize: 12 }} >
                        About TasteMaker
                </Button>
                </Grid>
                <Grid item xs={4}>
                </Grid>

                <Grid item xs={2}>
                    <IconButton onClick={() => { window.close(); }} >
                        <CloseIcon style={{ fontSize: 15 }} />
                    </IconButton>
                </Grid>

                <Grid item xs={12}>
                    <Divider />
                    <NameCard user_id={this.state.user_id} is_self={true} />
                </Grid>

                <Grid item xs={12}>
                    <Paper style={{ maxHeight: 420, width: 400, marginTop: 5, marginBottom: 5, overflowY: 'auto' }}>
                        <Card style={{ width: 400, display: 'flex', justifyContent: 'center' }}>
                            <CardActions>
                                <Button onClick={this.onClickCollectionShowBought} style={{ textTransform: "none" }} >
                                    Your Collection - purchased
                                </Button>
                            </CardActions>
                        </Card>

                        <Collapse in={this.state.show_collection_bought}>
                            {
                                this.state.bought_product_list.map((product) => (
                                    <MyProductCard key={product._id + "_bought"} product={product} is_bought={true} show_details={false} delete_func={this.onDeleteBoughtProduct} />
                                ))
                            }
                        </Collapse>

                        <Card style={{ maxHeight: 400, marginTop: 6, display: 'flex', justifyContent: 'center' }}>
                            <CardActions>
                                <Button onClick={this.onShowClickCollectionLikedButton} style={{ textTransform: "none" }} >
                                    Your Collection - liked
                            </Button>
                            </CardActions>
                        </Card>

                        <Collapse in={this.state.show_collection_liked}>
                            {
                                this.state.liked_product_list.map((product) => (
                                    <MyProductCard key={product._id + "_liked"} product={product} is_liked={true} show_details={true} delete_func={this.onDeleteLikedProduct} />
                                ))
                            }
                        </Collapse>

                        <Card style={{ maxHeight: 380, marginTop: 6, display: 'flex', justifyContent: 'center' }}>
                            {this.state.num_friend_requests > 0 ?
                                <CardActions>
                                    <Badge color="secondary" variant="dot" >
                                        <Button onClick={this.onClickShowFriendsButton} style={{ textTransform: "none" }}>
                                            Friends
                                        </Button>
                                    </Badge>
                                </CardActions>
                                :
                                <CardActions>
                                    <Button onClick={this.onClickShowFriendsButton} style={{ textTransform: "none" }} >
                                        Friends
                                    </Button>
                                </CardActions>
                            }
                        </Card>
                        <Collapse in={this.state.show_friends}>
                            <div>
                                {this.state.received_friend_requests.map((friend) => (
                                    <FriendRequestCard key={friend._id} friend={friend} onUpdateFriendRequestStatus={this.onUpdateFriendRequestStatus} />
                                ))}
                                <Divider variant="middle" />
                                {this.state.friends_list.map((friend) => (
                                    <FriendCard key={friend._id} friend={friend} />
                                ))}
                            </div>
                        </Collapse>

                        <Card style={{ width: 400, marginTop: 6, display: 'flex', justifyContent: 'center' }}>
                            <CardActions>
                                <Button component="a"
                                    href={"mailto:tastemaker.hi@gmail.com?subject=Report Bug in TasteMaker&body=" +
                                        encodeURIComponent("TasteMaker team: Thanks for telling us your exprience. Feel free to tell us the issues your found (with screenshots if applicable) or any suggestions. \n")}
                                    style={{ textTransform: "none" }} >
                                    Report Bug
                                </Button>
                            </CardActions>
                        </Card>

                        <Card style={{ width: 400, marginTop: 6, display: 'flex', justifyContent: 'center' }}>
                            <CardActions>
                                <Button onClick={this.props.onLogOut} style={{ textTransform: "none" }} >
                                    Log Out
                                </Button>
                            </CardActions>
                        </Card>


                    </Paper>

                </Grid>
            </Grid >

        );
    }
}

export default UserInfoPage;

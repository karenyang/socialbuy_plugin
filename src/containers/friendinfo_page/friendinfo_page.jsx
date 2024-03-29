import React, {
    Component
} from 'react';
import {
    Grid,
    Card,
    Paper,
    Button,
    Badge,
    Divider,
} from '@material-ui/core';
import CardActions from '@material-ui/core/CardActions';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import CloseIcon from '@material-ui/icons/Close';
import NameCard from '../modules/name_card';
import OthersProductCard from '../modules/others_product_card';
import FriendCard from '../modules/friend_card';

class FriendInfoPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            bought_product_list: [],
            liked_product_list: [],
            friends_list: [],
            show_collection_bought: false,
            show_collection_liked: false,
            show_friends: false,
            user_id: this.props.match.params.user_id, // friend's id 
            is_friends_friends: this.props.is_friends_friends,
        }
        console.log("FriendInfoPage state:", this.state);
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
        ga('send', 'pageview', "friendinfo_page");

        const handleUpdate = this.handleUpdate;

        chrome.runtime.sendMessage({ type: "onLoadUserLikedProductList", data: this.state.user_id },
            function (res) {
                console.log('FriendInfo receives reply from background for onLoadUserLikedProductList ', res.data);
                if (res.status === 200) {
                    console.log("onLoadUserLikedProductList succeeded.");
                    handleUpdate("liked_product_list", res.data.liked_product_list);
                }
                else {
                    console.error(res.data + ", onLoadUserLikedProductList failed.");
                }
            }
        );
        chrome.runtime.sendMessage({ type: "onLoadUserBoughtProductList", data: this.state.user_id },
            function (res) {
                console.log('FriendInfo receives reply from background for onLoadUserBoughtProductList ', res.data);
                if (res.status === 200) {
                    console.log("onLoadUserBoughtProductList succeeded.");
                    handleUpdate("bought_product_list", res.data.bought_product_list);
                }
                else {
                    console.error(res.data + ", onLoadUserBoughtProductList failed.");
                }
            }
        );
        chrome.runtime.sendMessage({ type: "onLoadFriendsList", data: this.state.user_id },
            function (res) {
                console.log('FriendInfo receives reply from background for onLoadFriendsList ', res.data);
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

    onClickBack = () => {
        if (this.state.is_friends_friends) { // return to previous page of friend info
            console.log('is_friends_friends go back to previous friend page ');
            this.props.history.goBack();
        } else { //return to previous tab
            const tab = window.localStorage.getItem("tab");
            console.log('Before go back, go the key Tab is ', tab);
            this.props.history.push("/greetings/" + tab);
        }

    }

    handleUpdate = (name, value) => { //[name of variable]: value of variable
        this.setState({ [name]: value, });
        console.log("Update state-> ", this.state);
    }


    onClickCollectionShowBought = () => {
        ga('send', 'event', "Friendinfo_UIButton", "Click", "CollectionShowBought");
        this.setState({
            show_collection_bought: !this.state.show_collection_bought
        })
    }

    onShowClickCollectionLikedButton = () => {
        ga('send', 'event', "Friendinfo_UIButton", "Click", "CollectionShowLiked");
        this.setState({
            show_collection_liked: !this.state.show_collection_liked
        })
    }

    onClickShowFriendsButton = () => {
        ga('send', 'event', "Friendinfo_UIButton", 'Click', "ShowFriendsButton");
        this.setState({
            show_friends: !this.state.show_friends
        })
    }


    onClickDeleteFriend = () => {

        ga('send', 'event', "Friend", "DeleteFriend", this.state.user_name);

        let history = this.props.history;
        console.log("block clicked");
        chrome.runtime.sendMessage({ type: "onDeleteFriend", data: { 'friend_id': this.state.user_id } },
            function (res) {
                console.log('NameCard receives reply from background for onDeleteFriend ', res.data);
                if (res.status === 200) {
                    console.log("onDeleteFriend succeeded.");
                    const tab = window.localStorage.getItem("tab");
                    console.log('Before go back, go the key Tab is ', tab);
                    history.push("/greetings/" + tab);
                }
                else {
                    console.error(res.data + ", onDeleteFriend failed.");
                }
            }
        );

    }

    onClickUnfollow = () => {
        ga('send', 'event', "Friend", "Unfollow", this.state.user_name);

        let history = this.props.history;
        console.log("unfollow clicked");
        chrome.runtime.sendMessage({ type: "onUnfollowFriend", data: { 'friend_id': this.state.user_id } },
            function (res) {
                console.log('NameCard receives reply from background for onUnfollowFriend ', res.data);
                if (res.status === 200) {
                    console.log("onUnfollowFriend succeeded.");
                    const tab = window.localStorage.getItem("tab");
                    console.log('Before go back, go the key Tab is ', tab);
                    history.push("/greetings/" + tab);
                }
                else {
                    console.error(res.data + ", onUnfollowFriend failed.");
                }
            }
        );

    }

    render() {
        return (
            <Grid container spacing={0} alignItems="center" style={{ margin: 0, padding: 0 }}>
                <Grid item xs={2}>
                    <IconButton onClick={this.onClickBack}>
                        <ArrowBackIcon />
                    </IconButton>
                </Grid>
                <Grid item xs={8}>
                </Grid>
                <Grid item xs={2}>
                    <IconButton onClick={() => { window.close(); }} >
                        <CloseIcon style={{ fontSize: 15 }} />
                    </IconButton>
                </Grid>

                <Grid item xs={12}>
                    <Divider />
                    <NameCard user_id={this.state.user_id} is_self={false} onClickDeleteFriend={this.onClickDeleteFriend} onClickUnfollow={this.onClickUnfollow} />
                </Grid>

                <Grid item xs={12}>
                    <Paper style={{ maxHeight: 420, width: 400, marginLeft: 10, overflowY: 'auto' }}>
                        <Card style={{ width: 400, marginTop: 6, display: 'flex', justifyContent: 'center' }}>
                            <CardActions>
                                <Button onClick={this.onClickCollectionShowBought} style={{ textTransform: "none" }} >
                                    Collection - purchased
                            </Button>
                            </CardActions>
                        </Card>

                        <Collapse in={this.state.show_collection_bought}>
                            {
                                this.state.bought_product_list.map((product) => (
                                    <OthersProductCard key={product._id + "_bought"} product={product} />
                                ))
                            }
                        </Collapse>

                        <Card style={{ width: 400, marginTop: 6, display: 'flex', justifyContent: 'center' }}>
                            <CardActions>
                                <Button onClick={this.onShowClickCollectionLikedButton} style={{ textTransform: "none" }} >
                                    Collection - liked
                            </Button>
                            </CardActions>
                        </Card>

                        <Collapse in={this.state.show_collection_liked}>
                            {
                                this.state.liked_product_list.map((product) => (
                                    <OthersProductCard key={product._id + "_liked"} product={product} />
                                ))
                            }
                        </Collapse>

                        <Card style={{ width: 400, marginTop: 6, display: 'flex', justifyContent: 'center' }}>

                            <CardActions>
                                <Button onClick={this.onClickShowFriendsButton} style={{ textTransform: "none" }} >
                                    Friends
                                    </Button>
                            </CardActions>
                        </Card>
                        <Collapse in={this.state.show_friends}>

                            {this.state.friends_list.map((friend) => (
                                <FriendCard key={friend._id} friend={friend} show_mutual_friends={false}/>
                            ))}
                        </Collapse>

                    </Paper>

                </Grid>
            </Grid >

        );
    }
};

FriendCard.defaultProps = {
    is_friends_friends: false,
};




export default FriendInfoPage;

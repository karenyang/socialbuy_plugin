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
            user_id: this.props.match.params.user_id, // friend's name 
            user_name: "",
            profile_img: "",//friend's profile_img 
        }
        console.log(this.state);
    }


    componentDidMount = () => {
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
                    handleUpdate("liked_product_list", res.data.liked_product_list);
                }
                else {
                    console.error(res.data + ", onLoadUserBoughtProductList failed.");
                }
            }
        );
    }

    onClickBack = () => {
        const tab = window.localStorage.getItem("tab");
        console.log('Before go back, go the key Tab is ', tab);
        this.props.history.push("/greetings/" + tab);
    }

    handleUpdate = (name, value) => { //[name of variable]: value of variable
        this.setState({ [name]: value, });
        console.log("Update state-> ", this.state);
    }


    onClickCollectionShowBoughtButton = () => {
        this.setState({
            show_collection_bought: !this.state.show_collection_bought
        })
    }

    onShowClickCollectionLikedButton = () => {
        this.setState({
            show_collection_liked: !this.state.show_collection_liked
        })
    }

    onClickShowFriendsButton = () => {
        this.setState({
            show_friends: !this.state.show_friends
        })
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
                    <NameCard user_id={this.state.user_id} />
                </Grid>

                <Grid item xs={12}>
                    <Paper style={{ maxHeight: 490, width: 400, margin: 5, overflowY: 'auto' }}>
                        <Card style={{ width: 400, marginTop: 6, display: 'flex', justifyContent: 'center' }}>
                            <CardActions>
                                <Button onClick={this.onClickCollectionShowBoughtButton} style={{ textTransform: "none" }} >
                                    Collection - purchased
                            </Button>
                            </CardActions>
                        </Card>

                        <Collapse in={this.state.show_collection_bought}>
                            {
                                this.state.bought_product_list.map((product) => (
                                    <OthersProductCard product={product} />
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
                                    <OthersProductCard product={product} />
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
                                <FriendCard friend={friend} />
                            ))}
                        </Collapse>

                    </Paper>

                </Grid>
            </Grid >

        );
    }
};

export default FriendInfoPage;

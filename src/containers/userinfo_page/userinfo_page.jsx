import React, {
    Component
} from 'react';
import {
    Grid,
    Typography,
    Card,
    Paper,
    Button,
    Badge
} from '@material-ui/core';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import icon from '../../assets/img/icon-34.png';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import Avatar from '@material-ui/core/Avatar';


class UserInfoPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            search_value: "",
            bought_product_list: [],
            liked_product_list: [],
            friends_list: [],
            received_friend_requests: [],
            search_result: "",
            tab: 0,
            show_collection_bought: false,
            show_collection_liked: false,
            show_friends: false,
        }
        console.log(this.state);
    }

    handleUpdate = (name, value) => { //[name of variable]: value of variable
        this.setState({ [name]: value, });
        console.log("Update state-> ", this.state);
    }

    componentDidMount = () => {
        const handleUpdate = this.handleUpdate;
        chrome.runtime.sendMessage({ type: "onLoadSelfBoughtProductList" },
            function (res) {
                console.log('Userinfo Page receives reply from background for onLoadSelfBoughtProductList ', res.data);
                if (res.status === 200) {
                    console.log("onLoadSelfBoughtProductList succeeded.");
                    handleUpdate("bought_product_list", res.data.bought_product_list);
                }
                else {
                    console.error(res.data + ", onLoadSelfProductList failed.");
                }
            }
        );
        chrome.runtime.sendMessage({ type: "onLoadSelfLikedProductList" },
            function (res) {
                console.log('Greetings receives reply from background for onLoadSelfLikedProductList ', res.data);
                if (res.status === 200) {
                    console.log("onLoadSelfLikedProductList succeeded.");
                    handleUpdate("liked_product_list", res.data.liked_product_list);
                }
                else {
                    console.error(res.data + ", onLoadSelfLikedProductList failed.");
                }
            }
        );
        chrome.runtime.sendMessage({ type: "onLoadFriendsList" },
            function (res) {
                console.log('Greetings receives reply from background for onLoadFriendsList ', res.data);
                if (res.status === 200) {
                    console.log("onLoadFriendsList succeeded.");
                    handleUpdate("friends_list", res.data.friends_list);
                }
                else {
                    console.error(res.data + ", onLoadSelfBoughtProductList failed.");
                }
            }
        );

        chrome.runtime.sendMessage({ type: "onLoadFriendRequestsList" },
            function (res) {
                console.log('Greetings receives reply from background for onLoadFriendRequestsList ', res.data);
                if (res.status === 200) {
                    console.log("onLoadFriendsList succeeded.");
                    handleUpdate("received_friend_requests", res.data.received_friend_requests);
                }
                else {
                    console.error(res.data + ", onLoadFriendRequestsList failed.");
                }
            }
        );
    }

    onClickProduct(product) {
        console.log("product clicked.", product.product_title);
        chrome.runtime.sendMessage({ type: "onClickProduct", data: product.product_link },
            function (res) {
                console.log("Page opened for product: ", product.title);
            }
        );
    }


    cropTitle = (product_title) => {
        let title = product_title.split(" ");
        return title.slice(0, 10).join(" ");
    }

    onDeleteBoughtProduct(product_id) {
        console.log("product to be delete has id", product_id);
        let new_bought_product_list = this.state.bought_product_list.filter(item => item['_id'] !== product_id);

        this.setState({
            bought_product_list: new_bought_product_list,
        });
        chrome.runtime.sendMessage({ type: "onDeleteSelfBoughtProduct", data: product_id },
            function (res) {
                console.log('Greetings receives reply from background for onDeleteSelfBoughtProduct ', res.data);
                if (res.status === 200) {
                    console.log("onDeleteSelfBoughtProduct succeeded.");
                }
                else {
                    console.error(res.data + ", onDeleteSelfBoughtProduct failed.");
                }
            }
        );
    }

    onDeleteLikedProduct(product_id) {
        console.log("product to be delete has id", product_id);
        let new_liked_product_list = this.state.liked_product_list.filter(item => item['_id'] !== product_id);
        this.setState({
            liked_product_list: new_liked_product_list,
        });
        chrome.runtime.sendMessage({ type: "onDeleteSelfLikedProduct", data: product_id },
            function (res) {
                console.log('Greetings receives reply from background for onDeleteSelfLikedProduct', res.data);
                if (res.status === 200) {
                    console.log("onDeleteSelfLikedProduct succeeded.");
                }
                else {
                    console.error(res.data + ", onDeleteSelfLikedProduct failed.");
                }
            }
        );
    }

    onClickCollectionBoughtButton = () => {
        this.setState({
            show_collection_bought: !this.state.show_collection_bought
        })
    }

    onClickCollectionLikedButton = () => {
        this.setState({
            show_collection_liked: !this.state.show_collection_liked
        })
    }

    onClickFriendsButton = () => {
        this.setState({
            show_friends: !this.state.show_friends
        })
    }

    onClickFriend = (friend) => {
        console.log("friend clicked: ", friend.user_name);
    }

    onHandleFriendRequest = (name, is_accept_friend) => {
        console.log("onHandleFriendRequest: ", name);
        chrome.runtime.sendMessage({ type: "onHandleFriendRequest", data: { "friend_username": name, "is_accept_friend": is_accept_friend } },
            function (res) {
                console.log('useringo receives reply from background for onHandleFriendRequest ', res.data);
            }
        );
    }


    render() {
        return (
            <Grid container spacing={0} alignItems="center" justify="center" >
                <Grid item xs={2}>
                    <img src={icon} alt="extension icon" />
                </Grid>
                <Grid item xs={10}>
                </Grid>
                <Grid item xs={12}>
                    <Paper style={{ maxHeight: 490, width: 400, marginTop: 5, overflow: 'auto' }}>
                        <Card style={{ width: 400, marginTop: 5, display: 'flex', justifyContent: 'center' }}>
                            <CardActions>
                                <Button onClick={this.onClickCollectionBoughtButton} style={{ textTransform: "none" }} >
                                    Your Collection - purchased
                            </Button>
                            </CardActions>
                        </Card>

                        <Collapse in={this.state.show_collection_bought}>
                            <Paper style={{ maxHeight: 450, width: 400, marginTop: 5, overflow: 'auto' }}>
                                {
                                    this.state.bought_product_list.map((product) => (
                                        <Card key={product._id}>
                                            <Grid container spacing={0}  >
                                                <Grid item xs={4}>
                                                    <CardActionArea>
                                                        <img alt={product.product_title} src={product.product_imgurl} width="100" onClick={() => { this.onClickProduct(product) }} />
                                                    </CardActionArea>
                                                </Grid>
                                                <Grid item xs={7}>
                                                    <CardContent >
                                                        <Typography gutterBottom variant="body2" component="h5">
                                                            {this.cropTitle(product.product_title)}
                                                        </Typography>
                                                    </CardContent>
                                                </Grid>
                                                <Grid item xs={1}>
                                                    <CardActions>
                                                        <IconButton
                                                            style={{ padding: 0, height: 18, width: 18 }}
                                                            onClick={() => this.onDeleteBoughtProduct(product._id)}
                                                        >
                                                            <DeleteIcon style={{ fontSize: 15 }} />
                                                        </IconButton>
                                                    </CardActions>
                                                </Grid>
                                            </Grid>
                                        </Card>
                                    ))
                                }
                            </Paper>
                        </Collapse>

                        <Card style={{ width: 400, marginTop: 5, display: 'flex', justifyContent: 'center' }}>
                            <CardActions>
                                <Button onClick={this.onClickCollectionLikedButton} style={{ textTransform: "none" }} >
                                    Your Collection - liked
                            </Button>
                            </CardActions>
                        </Card>

                        <Collapse in={this.state.show_collection_liked}>
                            <Paper style={{ maxHeight: 450, width: 400, marginTop: 5, overflow: 'auto' }}>
                                {
                                    this.state.liked_product_list.map((product) => (
                                        <Card key={product._id}>
                                            <Grid container spacing={0}  >
                                                <Grid item xs={4}>
                                                    <CardActionArea>
                                                        <img alt={product.product_title} src={product.product_imgurl} width="100" onClick={() => { this.onClickProduct(product) }} />
                                                    </CardActionArea>
                                                </Grid>
                                                <Grid item xs={7}>
                                                    <CardContent >
                                                        <Typography gutterBottom variant="body2" component="h5">
                                                            {this.cropTitle(product.product_title)}
                                                        </Typography>
                                                    </CardContent>
                                                </Grid>
                                                <Grid item xs={1}>
                                                    <CardActions>
                                                        <IconButton
                                                            style={{ padding: 0, height: 18, width: 18 }}
                                                            onClick={() => this.onDeleteLikedProduct(product._id)}
                                                        >
                                                            <DeleteIcon style={{ fontSize: 15 }} />
                                                        </IconButton>
                                                    </CardActions>
                                                </Grid>
                                            </Grid>
                                        </Card>
                                    ))
                                }
                            </Paper>
                        </Collapse>

                        <Card style={{ width: 400, marginTop: 5, display: 'flex', justifyContent: 'center' }}>
                            {this.state.received_friend_requests.length > 0 ?
                                <CardActions>
                                    <Badge color="secondary" variant="dot" >
                                        <Button onClick={this.onClickFriendsButton} style={{ textTransform: "none" }}>
                                            Friends
                                        </Button>
                                    </Badge>
                                </CardActions>
                                :
                                <CardActions>
                                    <Button onClick={this.onClickFriendsButton} style={{ textTransform: "none" }} >
                                        Friends
                                    </Button>
                                </CardActions>
                            }
                        </Card>
                        <Collapse in={this.state.show_friends}>
                            <Paper style={{ maxHeight: 450, width: 400, marginTop: 5, overflow: 'auto' }}>
                                {
                                    this.state.received_friend_requests.map((friend) => (
                                        <Card key={friend._id} >
                                            <Grid container spacing={0} style={{ display: 'flex', justifyContent: 'center', alignItems: "center" }}>
                                                <Grid item xs={3}>
                                                    <Avatar alt={friend.user_name} src={friend.profile_img} style={{ marginLeft: 8 }} />
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <CardContent >
                                                        <Typography gutterBottom variant="body2" component="h5">
                                                            {this.cropTitle(friend.user_name)}
                                                        </Typography>
                                                    </CardContent>
                                                </Grid>
                                                <Grid item xs={5}>
                                                    <CardActions>

                                                        <div style={{ display: 'flex', flexDirection: "column" }}>
                                                            <Typography variant="body2" component="h5" style={{ 'color': 'grey' }}>
                                                                sent you a friend request
                                                            </Typography>
                                                            <div style={{ display: 'flex', flexDirection: "row", justifyContent: "space-around"}}>
                                                                <Button style={{ textTransform: "none", backgroundColor: "#3366FF", color: "white" }}
                                                                    onClick={() => this.onHandleFriendRequest(friend.user_name, true)} >
                                                                    Confirm
                                                                    </Button>
                                                                <Button style={{ textTransform: "none", backgroundColor: "#D3D3D3" }}
                                                                    onClick={() => this.onHandleFriendRequest(friend.user_name, false)}>
                                                                    Delete
                                                                </Button>
                                                            </div>
                                                    </div>
                                                    </CardActions>
                                                </Grid>
                                            </Grid>
                                        </Card>
                                    ))
                                }
                                {
                                    this.state.friends_list.map((friend) => (
                                        <Card key={friend._id} >
                                            <CardActionArea onClick={() => { this.onClickFriend(friend) }}>
                                                <Grid container spacing={0} style={{ display: 'flex', justifyContent: 'center', alignItems: "center" }}>
                                                    <Grid item xs={3}>
                                                        <Avatar alt={friend.user_name} src={friend.profile_img} style={{ marginLeft: 8 }} />
                                                    </Grid>
                                                    <Grid item xs={4}>
                                                        <CardContent >
                                                            <Typography gutterBottom variant="body2" component="h5">
                                                                {this.cropTitle(friend.user_name)}
                                                            </Typography>
                                                        </CardContent>
                                                    </Grid>
                                                    <Grid item xs={5}>

                                                    </Grid>
                                                </Grid>
                                            </CardActionArea>
                                        </Card>
                                    ))
                                }
                            </Paper>
                        </Collapse>

                        <Card style={{ width: 400, marginTop: 5, display: 'flex', justifyContent: 'center' }}>
                            <CardActions>
                                <Button onClick={this.props.onLogOut} style={{ textTransform: "none" }} >
                                    Log Out
                            </Button>
                            </CardActions>
                        </Card>
                    </Paper>

                </Grid>
            </Grid>

        );
    }
}

export default UserInfoPage;

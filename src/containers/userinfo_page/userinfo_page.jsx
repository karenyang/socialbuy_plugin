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
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import icon from '../../assets/img/icon-34.png';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import DeleteIcon from '@material-ui/icons/Delete';
import Avatar from '@material-ui/core/Avatar';
import "./userinfo_page.css";
import NameCard from '../modules/name_card'
  

class UserInfoPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user_id: this.props.user_id,
            bought_product_list: [],
            liked_product_list: [],
            friends_list: [],
            received_friend_requests: [],
            show_collection_bought: false,
            show_collection_liked: false,
            show_friends: false,
            user_name: "", //login user's name 
            profile_img: "",//login user's profile_img 
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
        // DESIGN choice: arbitrary: load liked products, and friend requests upfront, not friends and bought products
        const handleUpdate = this.handleUpdate;
        const handleUpdateSelf = this.handleUpdateSelf;
        chrome.runtime.sendMessage({ type: "onLoadUserInfo" },
            function (res) {
                console.log('Userinfo receives reply from background for onLoadUserInfo ', res.data);
                if (res.status === 200) {
                    console.log("onLoadUserInfo succeeded.");
                    handleUpdateSelf(res.data);
                }
                else {
                    console.error(res.data + ", onLoadUserInfo failed.");
                }
            }
        );
        //assuming people will see liked products more often on this page
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

    onDeleteLikedProduct(product_id) {
        console.log("product to be delete has id", product_id);
        let new_liked_product_list = this.state.liked_product_list.filter(item => item['_id'] !== product_id);
        this.setState({
            liked_product_list: new_liked_product_list,
        });
        chrome.runtime.sendMessage({ type: "onDeleteSelfLikedProduct", data: product_id },
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

    onClickCollectionBoughtButton = () => {
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
        const handleUpdate = this.handleUpdate;
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
            <Grid container spacing={0} alignItems="center" style={{margin:0, padding:0}}>
                <Grid item xs={2}>
                    <img src={icon} alt="extension icon" width="25px" />
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
                    <NameCard user_id={this.state.user_id}/>
                </Grid>

                <Grid item xs={12}>
                    <Paper style={{ maxHeight: 490, width: 400, margin: 5, overflowY: 'auto' }}>
                        <Card style={{ width: 400, marginTop: 6, display: 'flex', justifyContent: 'center' }}>
                            <CardActions>
                                <Button onClick={this.onClickCollectionBoughtButton} style={{ textTransform: "none" }} >
                                    Your Collection - purchased
                            </Button>
                            </CardActions>
                        </Card>

                        <Collapse in={this.state.show_collection_bought}>
                            {
                                this.state.bought_product_list.map((product) => (
                                    <div key={product._id} style={{ padding: "10px" }}>
                                        <Grid container spacing={2}  >
                                            <Grid item xs={4}>
                                                <CardActionArea>
                                                    <img className="productimage" alt={product.product_title} src={product.product_imgurl} width="100" onClick={() => { this.onClickProduct(product) }} />
                                                </CardActionArea>
                                            </Grid>
                                            <Grid item xs={7}>
                                                <CardContent style={{ padding: "8px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                    <Typography gutterBottom variant="body2" component="h5" style={{ "fontSize": 12 }}>
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
                                        <Divider />
                                    </div>
                                ))
                            }
                        </Collapse>

                        <Card style={{ width: 400, marginTop: 6, display: 'flex', justifyContent: 'center' }}>
                            <CardActions>
                                <Button onClick={this.onClickCollectionLikedButton} style={{ textTransform: "none" }} >
                                    Your Collection - liked
                            </Button>
                            </CardActions>
                        </Card>

                        <Collapse in={this.state.show_collection_liked}>
                            {
                                this.state.liked_product_list.map((product) => (
                                    <div key={product._id} style={{ padding: "10px" }}>
                                        <Grid container spacing={2}  >
                                            <Grid item xs={4}>
                                                <CardActionArea>
                                                    <img className="productimage" alt={product.product_title} src={product.product_imgurl} width="100" onClick={() => { this.onClickProduct(product) }} />
                                                </CardActionArea>
                                            </Grid>
                                            <Grid item xs={7}>
                                                <CardContent style={{ padding: "8px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                    <Typography gutterBottom variant="body2" component="h5" style={{ "fontSize": 12 }}>
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
                                        <Divider />
                                    </div>
                                ))
                            }
                        </Collapse>

                        <Card style={{ width: 400, marginTop: 6, display: 'flex', justifyContent: 'center' }}>
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
                            <div>
                                {this.state.received_friend_requests.map((friend) => (
                                    <div key={friend._id}>
                                        <Grid container spacing={0} style={{ display: 'flex', justifyContent: 'center', alignItems: "center" }}>
                                            <Grid item xs={2}>
                                                <Avatar className="avatar" alt={friend.user_name} src={friend.profile_img} onClick={() => this.onClickFriend(friend)} />
                                            </Grid>
                                            <Grid item xs={5}>
                                                <CardContent >
                                                    <Typography gutterBottom variant="body2" component="h5">
                                                        {this.cropTitle(friend.user_name)}
                                                    </Typography>
                                                    {friend.mutual_friends.length > 0 &&
                                                        <Typography variant="body2" component="h5" style={{ 'color': 'grey' }}>
                                                            {friend.mutual_friends} mutual friends
                                                            </Typography>
                                                    }
                                                </CardContent>
                                            </Grid>
                                            <Grid item xs={5}>
                                                <CardActions>
                                                    <div style={{ display: 'flex', flexDirection: "column" }}>
                                                        <Typography variant="body2" component="h5" style={{ 'color': 'grey' }}>
                                                            sent you a friend request
                                                            </Typography>

                                                        <div style={{ display: 'flex', flexDirection: "row", justifyContent: "space-around" }}>
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
                                    </div>
                                ))}
                                <Divider variant="middle" />
                                {this.state.friends_list.map((friend) => (
                                    <CardActionArea key={friend._id} component="a" href={"#/users/"+friend._id+"/2"}style={{ padding: 5 }}>
                                        <Grid container spacing={0} style={{ display: 'flex', justifyContent: 'center', alignItems: "center" }}>
                                            <Grid item xs={2}>
                                                <Avatar className="avatar" alt={friend.user_name} src={friend.profile_img} />
                                            </Grid>
                                            <Grid item xs={5}>
                                                <Typography gutterBottom variant="body2" component="h5">
                                                    {this.cropTitle(friend.user_name)}
                                                </Typography>

                                            </Grid>
                                            <Grid item xs={5}>
                                                {friend.mutual_friends.length > 0 &&
                                                    <Typography variant="body2" component="h5" style={{ 'color': 'grey' }}>
                                                        {friend.mutual_friends.length} mutual friends
                                                                </Typography>
                                                }
                                            </Grid>

                                        </Grid>
                                    </CardActionArea>
                                ))}
                            </div>
                        </Collapse>
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

import React, {
    Component
} from 'react';
import {
    Grid,
    Typography,
    Card,
    Paper,
    Button
} from '@material-ui/core';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import icon from '../../assets/img/icon-34.png';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';

class UserInfoPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            search_value: "",
            self_bought_product_list: [],
            self_liked_product_list: [],
            friends_list: [],
            search_result: "",
            tab: 0,
            show_collection_bought: false,
            show_collection_liked: false,

            show_friends: false,
        }
        console.log(this.state);
    }


    updateSelfBoughtProductList = (bought_product_list) => {
        this.setState({
            self_bought_product_list: bought_product_list,
        });
        console.log("State product list updated: ", this.state);
    }

    updateSelfLikedProductList = (liked_product_list) => {
        this.setState({
            self_liked_product_list: liked_product_list,
        });
        console.log("State product list updated: ", this.state);
    }


    updateFriendsList = (friends_list) => {
        this.setState({
            friends_list: friends_list,
        });
        console.log("State friend list updated: ", this.state);
    }

    componentDidMount = () => {
        const updateSelfBoughtProductList = this.updateSelfBoughtProductList;
        chrome.runtime.sendMessage({ type: "onLoadSelfBoughtProductList" },
            function (res) {
                console.log('Greetings receives reply from background for onLoadSelfBoughtProductList ', res.data);
                if (res.status === 200) {
                    console.log("onLoadSelfBoughtProductList succeeded.");
                    updateSelfBoughtProductList(res.data.bought_product_list);
                }
                else {
                    console.error(res.data + ", onLoadSelfProductList failed.");
                }
            }
        );

        const updateSelfLikedProductList = this.updateSelfLikedProductList;

        chrome.runtime.sendMessage({ type: "onLoadSelfLikedProductList" },
            function (res) {
                console.log('Greetings receives reply from background for onLoadSelfLikedProductList ', res.data);
                if (res.status === 200) {
                    console.log("onLoadSelfLikedProductList succeeded.");
                    updateSelfLikedProductList(res.data.liked_product_list);
                }
                else {
                    console.error(res.data + ", onLoadSelfLikedProductList failed.");
                }
            }
        );


        const updateFriendsList = this.updateFriendsList;
        chrome.runtime.sendMessage({ type: "onLoadFriendsList" },
            function (res) {
                console.log('Greetings receives reply from background for onLoadFriendsList ', res.data);
                if (res.status === 200) {
                    console.log("onLoadFriendsList succeeded.");
                    updateFriendsList(res.data.friends_list);
                }
                else {
                    console.error(res.data + ", onLoadSelfBoughtProductList failed.");
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
        let new_self_bought_product_list = this.state.self_bought_product_list.filter(item => item['_id'] !== product_id);

        this.setState({
            self_bought_product_list: new_self_bought_product_list,
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
        let new_self_liked_product_list = this.state.self_liked_product_list.filter(item => item['_id'] !== product_id);
        this.setState({
            self_liked_product_list: new_self_liked_product_list,
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
                                    this.state.self_bought_product_list.map((product) => (
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
                                    this.state.self_liked_product_list.map((product) => (
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
                            <CardActions>
                                <Button onClick={this.onClickFriendsButton} style={{ textTransform: "none" }} >
                                    Friends
                                </Button>
                            </CardActions>
                        </Card>
                        <Collapse in={this.state.show_friends}>
                            <Paper style={{ maxHeight: 450, width: 400, marginTop: 5, overflow: 'auto' }}>
                                {
                                    this.state.friends_list.map((friend) => (
                                        <Card key={friend._id}>
                                            <Grid container spacing={0}  >
                                                <Grid item xs={4}>
                                                    <CardActionArea>
                                                        <img alt={friend.user_name} src={friend.profile_img} width="75" onClick={() => { this.onClickFriend(friend) }} />
                                                    </CardActionArea>
                                                </Grid>
                                                <Grid item xs={7}>
                                                    <CardContent >
                                                        <Typography gutterBottom variant="body2" component="h5">
                                                            {this.cropTitle(friend.user_name)}
                                                        </Typography>
                                                    </CardContent>
                                                </Grid>
                                            </Grid>
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

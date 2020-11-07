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
            self_product_list: [],
            search_result: "",
            tab: 0,
            show_collection: false,
            show_friends: false,
        }
        console.log(this.state);
    }


    updateSelfProductList = (product_list) => {
        this.setState({
            self_product_list: product_list,
        });
        console.log("State product list updated: ", this.state);
    }

    componentDidMount = () => {
        const updateSelfProductList = this.updateSelfProductList;
        chrome.runtime.sendMessage({ type: "onLoadSelfProductList" },
            function (res) {
                console.log('Greetings receives reply from background for onLoadSelfProductList ', res.data);
                if (res.status === 200) {
                    console.log("onLoadSelfProductList succeeded.");
                    updateSelfProductList(res.data.product_list);
                }
                else {
                    console.error(res.data + ", onLoadSelfProductList failed.");
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

    onDeleteProduct(product_id) {
        console.log("product to be delete has id", product_id);
        let new_self_product_list = this.state.self_product_list.filter(item => item['_id'] !== product_id);

        this.setState({
            self_product_list: new_self_product_list,
        });
        chrome.runtime.sendMessage({ type: "onDeleteSelfProduct", data: product_id },
            function (res) {
                console.log('Greetings receives reply from background for onDeleteSelfProduct ', res.data);
                if (res.status === 200) {
                    console.log("onDeleteSelfProduct succeeded.");
                }
                else {
                    console.error(res.data + ", onDeleteSelfProduct failed.");
                }
            }
        );
    }

    onClickCollection = () => {
        this.setState({
            show_collection: !this.state.show_collection
        })
    }

    onClickFriends = () => {
        this.setState({
            show_friends: !this.state.show_friends
        })
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
                    {/* <Typography variant="h4" color="inherit" style={{ "fontSize": 16, "paddingTop": 5, "paddingBottom": 5 }}>
                        Your Collection - purchased
                    </Typography> */}

                    <Card style={{ width: 400, marginTop: 5, display: 'flex', justifyContent: 'center' }}>
                        <CardActions>
                            <Button onClick={this.onClickCollection} style={{ textTransform: "none" }} >
                                Your Collection - purchased
                            </Button>
                        </CardActions>
                    </Card>

                    <Collapse in={this.state.show_collection}>
                        <Paper style={{ maxHeight: 540, width: 400, marginTop: 5, overflow: 'auto' }}>
                            {
                                this.state.self_product_list.map((product) => (
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
                                                        onClick={() => this.onDeleteProduct(product._id)}
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
                            <Button onClick={this.onClickFriends} style={{ textTransform: "none" }} >
                                Friends
                            </Button>
                        </CardActions>
                    </Card>


                    <Card style={{ width: 400, marginTop: 5, display: 'flex', justifyContent: 'center' }}>
                        <CardActions>
                            <Button onClick={this.props.onLogOut} style={{ textTransform: "none" }} >
                                Log Out
                            </Button>
                        </CardActions>
                    </Card>

                </Grid>
            </Grid>

        );
    }
}

export default UserInfoPage;

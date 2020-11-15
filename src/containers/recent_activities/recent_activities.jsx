import React, {
    Component
} from 'react';
import {
    Grid,
    Typography,
    Card,
    Paper
} from '@material-ui/core';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import icon from '../../assets/img/icon-34.png';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import OtherProductCard from '../modules/others_product_card';
import OthersProductCard from '../modules/others_product_card';


class RecentActivitiesPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user_id: this.props.user_id,
            search_value: "",
            self_bought_product_list: [],
            friends_product_list: [],
            search_result: "",
            tab: 0,
        }
        console.log(this.state);
    }

    updateFriendsProductList = (friends_product_list) => {
        let product_objs = [];
        for (let i = 0; i < friends_product_list.length; i++) {
            let product = friends_product_list[i].product;
            product.friends_bought = friends_product_list[i].bought;
            product.friends_liked = friends_product_list[i].liked;
            product_objs.push(product);
        }
        this.setState({
            friends_product_list: product_objs,
        });
        console.log("State product list updated: ", this.state);

    }

    componentDidMount = () => {
        const updateFriendsProductList = this.updateFriendsProductList;
        chrome.runtime.sendMessage({ type: "onLoadFriendsProductList" },
            function (res) {
                console.log('Greetings receives reply from background for onLoadFriendsProductList ', res.data);
                if (res.status === 200) {
                    console.log("onLoadFriendsProductList succeeded.");
                    updateFriendsProductList(res.data.friends_productlist);
                }
                else {
                    console.error(res.data + ", onLoadFriendsProductList failed.");
                }
            }
        );
    }


    render() {
        return (
            <Grid container spacing={0} alignItems="center" >
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
                    <Typography variant="h4" color="inherit" style={{ "fontSize": 16, "paddingTop": 5, "paddingBottom": 5 }}>
                        What's popular
                        </Typography>
                    <Paper style={{ maxHeight: 470, width: 400, overflow: 'auto' }}>
                        {
                            this.state.friends_product_list.map((product) => (
                                <OthersProductCard key={product._id} product={product}/>
                            ))
                        }
                    </Paper>
                </Grid>
            </Grid>

        );
    }
}

export default RecentActivitiesPage;

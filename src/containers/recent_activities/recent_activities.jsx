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
            friends_product_list: [],
        }
        console.log(this.state);
    }

    updateFriendsProductList = (friends_product_list) => {
        this.setState({
            friends_product_list: friends_product_list,
        });
        console.log("State product list updated: ", this.state);

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
        ga('send', 'pageview', "recent_activities_page");

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
                    <Paper style={{ maxHeight: 420, width: 400, overflow: 'auto' }}>
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

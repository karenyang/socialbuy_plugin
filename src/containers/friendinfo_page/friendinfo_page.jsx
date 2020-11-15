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
    Avatar,
} from '@material-ui/core';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import icon from '../../assets/img/icon-34.png';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import CloseIcon from '@material-ui/icons/Close';
import DeleteIcon from '@material-ui/icons/Delete';
import NameCard from '../modules/name_card';

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

    onClickBack = () => {
        const tab = window.localStorage.getItem("tab");
        console.log('Before go back, go the key Tab is ', tab);
        this.props.history.push("/greetings/" + tab);
    }

    handleUpdate = (name, value) => { //[name of variable]: value of variable
        this.setState({ [name]: value, });
        console.log("Update state-> ", this.state);
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


    render() {
        return (
            <div>
                <img src={icon} alt="icon" />
                <IconButton onClick={this.onClickBack}>
                    <ArrowBackIcon />
                </IconButton>
                <NameCard user_id={this.state.user_id}/>

            </div>
        )
    }
};

export default FriendInfoPage;

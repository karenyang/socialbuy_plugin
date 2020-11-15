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

class NameCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            is_self: false,
            user_id: this.props.user_id, 
            user_name: "",
            profile_img: "",
        }
        console.log(this.state);
    }

    handleUpdateUserInfo = (data) => {
        this.setState({
            user_name: data.user_name,
            profile_img: data.profile_img,
        })
        console.log("updated self: ", this.state);
    }

    componentDidMount = () => {
        // DESIGN choice: arbitrary: load liked products, and friend requests upfront, not friends and bought products
        const handleUpdateUserInfo = this.handleUpdateUserInfo;
        chrome.runtime.sendMessage({ type: "onLoadUserInfo", data: this.state.user_id },
            function (res) {
                console.log('FriendInfo receives reply from background for onLoadUserInfo ', res.data);
                if (res.status === 200) {
                    console.log("onLoadUserInfo succeeded.");
                    handleUpdateUserInfo(res.data);
                }
                else {
                    console.error(res.data + ", onLoadUserInfo failed.");
                }
            }
        );

    }

    onClickProfileImg = () => {
        if(this.state.is_self) {
            console.log("can update profile image --- TODO");

        }else{
            console.log("just view, cannot update profile image --- TODO");
        }
    }
    
    render() {
        return (
            <div style={{ width: 400, margin: 0, padding: 10, display: 'flex', flexDirection: "row", alignItems: "center" }}>
                <Avatar className="avatar" alt={this.state.user_name} src={this.state.profile_img} onClick={this.onClickProfileImg} />
                <Typography variant="body1" component="h5" style={{ width: 200 }}>
                    {this.state.user_name}
                </Typography>
            </div>
        )
    }
}

export default NameCard;

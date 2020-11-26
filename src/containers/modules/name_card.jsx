import React, {
    Component
} from 'react';

import {
    Typography,
    Avatar,
    Button,
    IconButton,
} from '@material-ui/core';

class NameCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user_id: this.props.user_id,
            user_name: "",
            profile_img: "",
            is_self: this.props.is_self,
            ready_for_upload: false,
            is_follows_me: false,
            is_followed_by_me: false,
        }
        // this.uploadImage = null;
        console.log(this.state);

    }

    handleUpdateUserInfo = (data) => {
        this.setState({
            user_name: data.user_name,
            profile_img: data.profile_img,
            is_followed_by_me: data.is_followed_by_me,
            is_follows_me: data.is_followes_me,
        })
        console.log("updated self: ", this.state);
    }

    componentDidMount = () => {
        // DESIGN choice: arbitrary: load liked products, and friend requests upfront, not friends and bought products
        const handleUpdateUserInfo = this.handleUpdateUserInfo;
        chrome.runtime.sendMessage({ type: "onLoadUserInfo", data: this.state.user_id },
            function (res) {
                console.log('NameCard receives reply from background for onLoadUserInfo ', res.data);
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


    updateState = (name, value) => {
        this.setState({
            [name]: value,
        })
    }

    onUploadPhoto = async (e) => {
        ga('send', 'event', "UserProfile", 'Photo', this.state.user_name);

        
        if (this.state.is_self) {
            console.log("can update profile image --- TODO");
            e.preventDefault();
            // Create a DOM form and add the file to it under the name uploadedphoto
            if (this.state.ready_for_upload) {
               
                const updateState = this.updateState;
                chrome.runtime.sendMessage({ type: "onUploadUserInfo", data: { "profile_img": this.state.profile_img }},
                    function (res) {
                        console.log('Userinfo receives reply from background for imgurl ', res.data);
                        if (res.status === 200) {
                            console.log("onUploadProfileImg succeeded.");
                            updateState("ready_for_upload", false);
                        }
                        else {
                            console.error(res.data + ", imgurl failed.");
                        }
                    }
                );
            }

        } else {
            console.log("just view, should not update profile image");
        }
    }

    handleChange = e => {
        if (e.target.files.length) {
            this.setState({
                ready_for_upload: true,
                profile_img: window.URL.createObjectURL(e.target.files[0]),
            });
        }
    };

    render() {
        return (
            <div style={{ width: 400, margin: 0, padding: 10, display: 'flex', flexDirection: "row", alignItems: "center" }}>
                {this.state.is_self ?
                    <div>
                        {/* <input type="file" accept="image/*" ref={(domFileRef) => { this.uploadInput = domFileRef; }} /> */}

                        <label htmlFor="contained-button-file">
                            <Avatar className="avatar" alt={this.state.user_name} src={this.state.profile_img} />
                        </label>
                        <input
                            accept="image/*"
                            id="contained-button-file"
                            type="file"
                            style={{ display: "none" }}
                            onChange={this.handleChange}
                        />

                    </div>
                    :
                    <Avatar className="avatar" alt={this.state.user_name} src={this.state.profile_img} />
                }
                {this.state.ready_for_upload &&
                    <Button variant="outlined" onClick={this.onUploadPhoto} style={{ textTransform: "none", fontSize: 10 }}>
                        Update Profile
                    </Button>
                }
                <Typography variant="body1" component="h5" style={{ width: 200 }}>
                    {this.state.user_name}
                </Typography>
                { !this.state.is_self && this.state.is_followed_by_me && 
                    <Button onClick={this.props.onClickUnfollow} style={{ textTransform: "none", fontSize: 13, backgroundColor: "#EBEBEB", right: 10, position: "absolute" }} >
                        Unfollow
                    </Button>
                }
                { !this.state.is_self && this.state.is_follows_me && 
                    <Button onClick={this.props.onClickDeleteFriend} style={{ textTransform: "none", fontSize: 13, backgroundColor: "#EBEBEB", right: 10, position: "absolute" }} >
                        Block
                    </Button>
                }

            </div>
        )
    }
}

export default NameCard;

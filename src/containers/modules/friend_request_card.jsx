import React, {
    Component
} from 'react';

import {
    Typography,
    Avatar,
    Grid,
    Button,
    CardActions,
    CardActionArea,
} from '@material-ui/core';

class FriendRequestCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            friend: this.props.friend,
            show: true,
        }
        console.log(this.state);
    }


    updateState = (name, value) =>{
        this.setState({
            [name]: value,
        })
    }

    onHandleFriendRequest = (name, is_accept_friend) => {
        console.log("onHandleFriendRequest: ", name);
        const updateState = this.updateState; 
        const  onUpdateFriendRequestStatus = this.props.onUpdateFriendRequestStatus;

        chrome.runtime.sendMessage({ type: "onHandleFriendRequest", data: { "friend_username": name, "is_accept_friend": is_accept_friend } },
            function (res) {
                console.log('FriendRequestCard receives reply from background for onHandleFriendRequest ', res.data);
                onUpdateFriendRequestStatus();
                updateState("show",false);

            }
        );
        
    }

    render() {
        const friend = this.state.friend;
        if (!this.state.show) {
            return null;
        }
            return (
                <div key={friend._id}>
                    <Grid container spacing={0} style={{ display: 'flex', justifyContent: 'center', alignItems: "center" }}>
                        <Grid item xs={2}>
                            <Avatar className="avatar" alt={friend.user_name} src={friend.profile_img} onClick={() => this.onClickFriend(friend)} />
                        </Grid>
                        <Grid item xs={5}>
                            <CardActionArea key={friend._id} component="a" href={"#/users/" + friend._id + "/2"} style={{ padding: 5 }}>
                                <Typography gutterBottom variant="body2" component="h5">
                                    {friend.user_name}
                                </Typography>
                                {friend.mutual_friends.length > 0 &&
                                    <Typography variant="body2" component="h5" style={{ 'color': 'grey' }}>
                                        {friend.mutual_friends.length} mutual friends
                                </Typography>
                                }
                            </CardActionArea>
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
            )
        
    }
}

export default FriendRequestCard;

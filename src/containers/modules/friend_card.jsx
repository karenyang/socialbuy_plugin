import React, {
    Component
} from 'react';

import {
    Typography,
    Avatar,
    Grid,
    CardActionArea,
} from '@material-ui/core';

class FriendCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            friend: this.props.friend,
        }
        console.log(this.state);
    }

    onClickFriend = (friend) => {
        console.log("friend clicked: ", friend.user_name);
    }


    render() {
        const friend = this.state.friend;
        return (
            <CardActionArea key={friend._id} component="a" href={"#/users/" + friend._id + "/2"} style={{ padding: 5 }}>
                <Grid container spacing={0} style={{ display: 'flex', justifyContent: 'center', alignItems: "center" }}>
                    <Grid item xs={2}>
                        <Avatar className="avatar" alt={friend.user_name} src={friend.profile_img} />
                    </Grid>
                    <Grid item xs={5}>
                        <Typography gutterBottom variant="body2" component="h5">
                            {friend.user_name}
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
        )
    }
}

export default FriendCard;

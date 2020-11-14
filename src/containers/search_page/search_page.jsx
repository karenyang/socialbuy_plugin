import React, {
    Component
} from 'react';
import {
    Grid,
    Typography,
    Card,
    Paper
} from '@material-ui/core';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import icon from '../../assets/img/icon-34.png';
import SearchIcon from '@material-ui/icons/Search';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

class SearchPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            search_value: "",
            search_results: "",
        }
        console.log(this.state);
    }

    handleInputChange = (event) => {
        const {
            value,
            name
        } = event.target;
        this.setState({
            [name]: value
        });
    }

    updateSearchResult = (res) => {
        if (res.status === 200) {
            this.setState({ search_results: res.data });
        }
        else {
            this.setState({ search_results: "" });
        }
    }

    handleSearch = (event) => {
        const updateSearchResult = this.updateSearchResult;
        if (event.key === 'Enter') {
            console.log('Searching for: ', event.target.value);
            chrome.runtime.sendMessage({ type: "onHandleSearch", data: { "search_category": "friends", "search_key": event.target.value } },
                function (res) {
                    console.log('SearchPage receives reply from background for onHandleSearch ', res.data);
                    updateSearchResult(res);
                }
            );
        }
    }

    onRequestFriend = (name) => {
        console.log("onRequestFriend: ", name);
        chrome.runtime.sendMessage({ type: "onRequestFriend", data: { "friend_username": name } },
            function (res) {
                console.log('SearchPage receives reply from background for onRequestFriend ', res.data);
            }
        );
    }

    onHandleFriendRequest = (name, is_accept_friend) => {
        console.log("onHandleFriendRequest: ", name);
        chrome.runtime.sendMessage({ type: "onHandleFriendRequest", data: { "friend_username": name , "is_accept_friend": is_accept_friend} },
            function (res) {
                console.log('SearchPage receives reply from background for onHandleFriendRequest ', res.data);
            }
        );
    }

    render() {
        return (
            <Grid container spacing={0} alignItems="center" justifyContent="center"  >
                <Grid item xs={2}>
                    <img src={icon} alt="extension icon" width="25px" />
                </Grid>

                <Grid item xs={8}>
                    <div className="searchbox">
                        <TextField placeholder="Search…" style={{"paddingLeft": 4, "width": '100%' }}
                            name="search_value"
                            value={this.state.search_value}
                            onChange={this.handleInputChange}
                            onKeyPress={this.handleSearch}
                        />
                    </div>
                </Grid>
                <Grid item xs={2}>
                    <IconButton onClick={()=>{window.close();}} >
                        <CloseIcon style={{fontSize: 15}}/>
                    </IconButton>
                    
                </Grid>
                {this.state.search_results !== "" &&
                    <Paper style={{ maxHeight: 540, width: 400, marginTop: 5, overflow: 'auto' }}>
                        {
                            this.state.search_results.results.map((result) => (
                                <Card key={result.user_name} style={{ width: 400, marginTop: 5, display: 'flex', justifyContent: 'center' }}>
                                    <Grid container spacing={0}  >

                                        <Grid item xs={5}>
                                            <CardContent >
                                                <Typography gutterBottom variant="body2" component="h5">
                                                    {result.user_name}
                                                </Typography>
                                            </CardContent>
                                        </Grid>

                                        <Grid item xs={7}>
                                            {!result.is_friend && !result.is_self && !result.is_received_friend_reqeust && !result.is_sent_friend_reqeust &&
                                                <CardActions>
                                                    <Button style={{ textTransform: "none" }}
                                                        onClick={() => this.onRequestFriend(result.user_name)}
                                                    >
                                                        Add Friend
                                                    </Button>
                                                </CardActions>
                                            }
                                            {result.is_friend && !result.is_self &&
                                                <CardContent >
                                                    <Typography variant="body2" component="h5" style={{'color': 'grey'}}>
                                                        Your friend
                                                    </Typography>
                                                </CardContent>
                                            }
                                            {result.is_self && !result.is_friend &&
                                                <CardContent >
                                                    <Typography variant="body2" component="h5" style={{'color': 'grey'}}>
                                                        Me
                                                    </Typography>
                                                </CardContent>
                                            }
                                            {result.is_sent_friend_reqeust && !result.is_friend &&
                                                <CardContent >
                                                    <Typography variant="body2" component="h5" style={{'color': 'grey'}}>
                                                        Friend request sent
                                                    </Typography>
                                                </CardContent>
                                            }
                                             {result.is_received_friend_reqeust && !result.is_friend &&
                                                <CardActions>
                                                    <Typography variant="body2" component="h5" style={{'color': 'grey'}}>
                                                        Friend request received
                                                    </Typography>
                                                    <div style={{display: 'flex'}}>
                                                    <Button style={{ textTransform: "none" }}
                                                        onClick={() => this.onHandleFriendRequest(result.user_name, true)}
                                                    >
                                                        Accept
                                                    </Button>
                                                    <Button style={{ textTransform: "none" }}
                                                        onClick={() => this.onHandleFriendRequest(result.user_name, false)}
                                                    >
                                                        Deny
                                                    </Button>
                                                    </div>
                                                </CardActions>
                                            }
                                        </Grid>
                                    </Grid>
                                </Card>
                            ))
                        }
                    </Paper>}
            </Grid>
        );
    }
}

export default SearchPage;

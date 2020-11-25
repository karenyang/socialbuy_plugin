import React, {
    Component
} from 'react';
import {
    Grid,
    Typography,
    Card,
    Paper,
    Tab,
    Tabs,
    Avatar,
    CardActionArea,
} from '@material-ui/core';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import icon from '../../assets/img/icon-34.png';
import SearchIcon from '@material-ui/icons/Search';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import OthersProductCard from '../modules/others_product_card';


function setStorageItem(message_type, data) {
    console.log("setStorage", message_type, ":", data);
    window.localStorage.setItem(message_type, JSON.stringify(data));
}

function getStorageItem(message_type) {
    return JSON.parse(window.localStorage.getItem(message_type));
}



class SearchPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user_id: this.props.user_id,
            search_input: "",
            search_results: [],
            search_category: "user",
            is_no_result: false,
        }
        console.log(this.state);
    }

    componentDidMount = () => {
        const stored_search_input = getStorageItem("search_input")
        if (stored_search_input) {
            this.setState(
                {
                    search_input: stored_search_input
                }
            )
        }
        // const stored_search_results = getStorageItem("search_results")
        // if (stored_search_input) {
        //     this.setState(
        //         {
        //             search_results: stored_search_results
        //         }
        //     )
        // }
        const stored_search_category = getStorageItem("search_category")
        if (stored_search_category) {
            this.setState(
                {
                    search_category: stored_search_category
                }
            )
        }

        if (stored_search_category && stored_search_input && stored_search_input !== "") {
            console.log('Searching for: ', stored_search_input);
            const updateSearchResult = this.updateSearchResult;
            let query = {
                search_category: this.state.search_category,
                search_key: stored_search_input,
                is_include_self_products: true,
            }
            chrome.runtime.sendMessage({ type: "onHandleSearch", data: query },
                function (res) {
                    console.log('SearchPage receives reply from background for onHandleSearch ', res.data);
                    updateSearchResult(res);
                }
            );
        }
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
        console.log("res status", res.status, "search results:", res.data.results)
        if (res.status === 200 && res.data.results.length > 0) {
            this.setState({
                search_results: res.data.results
            });
            setStorageItem("search_results", res.data.results);
            setStorageItem("search_input", this.state.search_input);
            setStorageItem("search_category", this.state.search_category);
        }
        else {
            this.setState({
                search_results: [],
                is_no_result: true
            });
            setStorageItem("search_results", "")
            setStorageItem("search_input", "")
            setStorageItem("search_category", this.state.search_category);

            console.log("should update with no result")
        }
    }

    handleSearch = (event) => {
        const updateSearchResult = this.updateSearchResult;
        if (event.key === 'Enter') {
            console.log('Searching for: ', event.target.value);
            this.setState({
                is_no_result: false,
            });
            let query = {
                search_category: this.state.search_category,
                search_key: event.target.value,
                is_include_self_products: true,
            }
            chrome.runtime.sendMessage({ type: "onHandleSearch", data: query },
                function (res) {
                    console.log('SearchPage receives reply from background for onHandleSearch ', res.data);
                    updateSearchResult(res);
                }
            );
        }
        // else if (event.key === 'Enter' && event.target.value === "") {
        //     this.setState({
        //         is_no_result: false,
        //         search_results: [],
        //     });
        // }
    }

    onRequestFriend = (name) => {
        console.log("onRequestFriend: ", name);
        let friend_requests = this.state.search_results;
        friend_requests.map(r => { if (r.user_name === name) { r.is_sent_friend_reqeust = true } });
        this.setState({
            search_results: friend_requests,
        })

        chrome.runtime.sendMessage({ type: "onRequestFriend", data: { "friend_username": name } },
            function (res) {
                console.log('SearchPage receives reply from background for onRequestFriend ', res.data);
            }
        );
    }

    onHandleFriendRequest = (name, is_accept_friend) => {
        console.log("onHandleFriendRequest: ", name);
        let friend_requests = this.state.search_results;
        friend_requests.map(r => {
            if (r.user_name === name) {
                r.is_friend = is_accept_friend;
                r.is_received_friend_reqeust = false;
            }
        });
        this.setState({
            search_results: friend_requests,
        })
        chrome.runtime.sendMessage({ type: "onHandleFriendRequest", data: { "friend_username": name, "is_accept_friend": is_accept_friend } },
            function (res) {
                console.log('SearchPage receives reply from background for onHandleFriendRequest ', res.data);
            }
        );
    }

    handleTabChange = (event, value) => {
        this.setState({
            search_results: [],
            search_category: value,
        })
    };


    render() {
        return (
            <Grid container spacing={0} alignItems="center" justify="center"  >
                <Grid item xs={2}>
                    <img src={icon} alt="extension icon" width="25px" />
                </Grid>

                <Grid item xs={8}>
                    <div className="searchbox">
                        <TextField placeholder="Search…" style={{ "paddingLeft": 4, "width": '100%' }}
                            name="search_input"
                            value={this.state.search_input}
                            onChange={this.handleInputChange}
                            onKeyPress={this.handleSearch}
                        />
                    </div>
                </Grid>
                <Grid item xs={2}>
                    <IconButton onClick={() => { window.close(); }} >
                        <CloseIcon style={{ fontSize: 15 }} />
                    </IconButton>

                </Grid>
                <Grid item xs={12}>

                    <Tabs
                        value={this.state.search_category}
                        onChange={this.handleTabChange}
                        variant="fullWidth"
                        indicatorColor="primary"
                        textColor="primary"
                        aria-label="search-tabs"
                        style={{ width: 400 }}
                    >
                        <Tab label="User" aria-label="user" value="user" style={{ textTransform: "none", fontSize: 12 }} />
                        <Tab label="Product" aria-label="product" value="product" style={{ textTransform: "none", fontSize: 12 }} />
                    </Tabs>

                    {this.state.is_no_result &&
                        (
                            <Typography gutterBottom variant="body2" component="h5">
                                No result found
                            </Typography>
                        )
                    }

                    {this.state.search_results !== [] && this.state.search_category === "product" &&
                        <Paper style={{ maxHeight: 540, width: 400, margin: 0, marginTop: 5, marginoverflow: 'auto' }}>
                            {
                                this.state.search_results.map((product) => (
                                    <OthersProductCard key={product._id} product={product} />
                                ))
                            }
                        </Paper>}

                    {this.state.search_results !== [] && this.state.search_category === "user" &&
                        <Paper style={{ maxHeight: 450, width: 400, marginTop: 5, overflow: 'auto' }}>
                            {
                                this.state.search_results.map((result) => (

                                    <Card key={result.user_name} style={{ width: 400, marginTop: 5 }}>
                                        <Grid container spacing={2} justify="center" align="center">
                                            <Grid item xs={3} >
                                                <CardActionArea key={result.user_name} component="a" href={"#/users/" + result._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-around" }}>
                                                    <CardContent style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                                                        <Avatar alt={result.user_name} src={result.profile_img} sytle={{ padding: 5 }} />
                                                        <Typography gutterBottom variant="body2" component="h5" style={{ fontSize: 14 }}>
                                                            {result.user_name}
                                                        </Typography>
                                                    </CardContent>
                                                </CardActionArea>
                                            </Grid>
                                            <Grid item xs={3} >
                                                <CardContent style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                                                    {result.num_mutual_friends > 0 && !result.is_self &&
                                                        <Typography gutterBottom variant="body2" component="h5" style={{ fontSize: 12 }}>
                                                            {result.num_mutual_friends} mutual friends
                                                        </Typography>}
                                                </CardContent>
                                            </Grid>

                                            <Grid item xs={6} >
                                                {!result.is_friend && !result.is_self && !result.is_received_friend_reqeust && !result.is_sent_friend_reqeust &&
                                                    <CardActions style={{ justifyContent: "center" }}>
                                                        <Button variant="contained" color="primary" style={{ textTransform: "none" }}
                                                            onClick={() => this.onRequestFriend(result.user_name)}
                                                        >
                                                            Follow
                                                    </Button>
                                                    </CardActions>
                                                }
                                                {result.is_friend && !result.is_self && !result.is_sent_friend_reqeust && !result.is_received_friend_reqeust &&
                                                    <CardContent >
                                                        <Typography variant="body2" component="h5" style={{ 'color': 'grey' }}>
                                                            Mutually followed
                                                    </Typography>
                                                    </CardContent>
                                                }
                                                {result.is_self && !result.is_friend &&
                                                    <CardContent >
                                                        <Typography variant="body2" component="h5" style={{ 'color': 'grey' }}>
                                                            Me
                                                    </Typography>
                                                    </CardContent>
                                                }
                                                {result.is_sent_friend_reqeust &&
                                                    <CardContent >
                                                        <Typography variant="body2" component="h5" style={{ 'color': 'grey' }}>
                                                            Followed
                                                    </Typography>
                                                    </CardContent>
                                                }
                                                {result.is_received_friend_reqeust &&
                                                    <CardActions>
                                                        <Typography variant="body2" component="h5" style={{ 'color': 'grey' }}>
                                                            Follows you
                                                    </Typography>
                                                        <div style={{ display: 'flex' }}>
                                                            <Button style={{ textTransform: "none" }}
                                                                onClick={() => this.onHandleFriendRequest(result.user_name, true)}
                                                            >
                                                                Follow back
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
            </Grid>
        );
    }
}

export default SearchPage;

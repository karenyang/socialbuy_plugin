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
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import icon from '../../assets/img/icon-34.png';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import FavoriteIcon from '@material-ui/icons/Favorite';
import ShareIcon from '@material-ui/icons/Share';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import IconButton from '@material-ui/core/IconButton';
import Collapse from '@material-ui/core/Collapse';
import DeleteIcon from '@material-ui/icons/Delete';
import SearchIcon from '@material-ui/icons/Search';
import TextField from '@material-ui/core/TextField';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import IconTabs from '../icontabs/iconstabs';


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
            if (!Array.isArray(res.data)) {
                this.setState({ search_results: [res.data] });
            }
            else {
                this.setState({ search_results: res.data });
            }
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

    onAddFriend = (name) => {
        console.log("onAddFriend: ", name);
        chrome.runtime.sendMessage({ type: "onAddFriend", data: { "friend_username": name } },
            function (res) {
                console.log('SearchPage receives reply from background for onAddFriend ', res.data);
            }
        );
    }

    render() {
        return (
            <Grid container spacing={0} alignItems="center" >
                <Grid item xs={2}>
                    <img src={icon} alt="extension icon" />
                </Grid>
                <Grid item xs={2}>
                    <div className="searchicon">
                        <SearchIcon style={{ "fontSize": 20, "alignItems": "center", "display": 'flex' }} />
                    </div>
                </Grid>
                <Grid item xs={7}>
                    <div className="searchbox">
                        <TextField placeholder="Search…" style={{ "padding": 1, "paddingLeft": 4, "width": '100%' }}
                            name="search_value"
                            value={this.state.search_value}
                            onChange={this.handleInputChange}
                            onKeyPress={this.handleSearch}
                        />
                    </div>
                </Grid>
                {this.state.search_results !== "" &&
                    <Paper style={{ maxHeight: 540, width: 400, marginTop: 5, overflow: 'auto' }}>
                        {
                            this.state.search_results.map((result) => (
                                <Card key={result}>
                                    <Grid container spacing={0}  >
                                        
                                        <Grid item xs={7}>
                                            <CardContent >
                                                <Typography gutterBottom variant="body2" component="h5">
                                                    {result}
                                                </Typography>
                                            </CardContent>
                                        </Grid>
                                        <Grid item xs={5}>
                                            <CardActions>
                                                <Button style={{ textTransform: "none" }} 
                                                    onClick={() => this.onAddFriend(result)}
                                                >
                                                    Add Friend
                                                </Button>
                                            </CardActions>
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

import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import SearchIcon from '@material-ui/icons/Search';
import WhatshotIcon from '@material-ui/icons/Whatshot';
import GroupIcon from '@material-ui/icons/Group';
import Badge from '@material-ui/core/Badge';


const useStyles = makeStyles({
    root: {
        flexGrow: 1,
        maxWidth: 500,
        top: 'auto',
        bottom: 0,
    },
});


const IconTabs = ({ handleTabChange, tab, num_friend_requests }) => {
    console.log("TAB value: ", tab, "num_friend_requests", num_friend_requests)
    const classes = useStyles();
    const [value, setValue] = React.useState(tab);

    const handleChange = (event, newValue) => {
        setValue(newValue);
        handleTabChange(newValue);
    };


    return (
        <AppBar square position="fixed" color="transparent" className={classes.root}>
            <Tabs
                value={value}
                onChange={handleChange}
                variant="fullWidth"
                indicatorColor="primary"
                textColor="primary"
                aria-label="icon tabs"
                style={{height: 60, padding: 0}}
            >
                <Tab icon={<WhatshotIcon />} aria-label="popular" label="Popular"  style={{padding: 0,fontSize: 12, textTransform: "none"}} />
                <Tab icon={<SearchIcon />} aria-label="search" label="Discover"  style={{padding: 0,fontSize: 12, textTransform: "none"}} />
                {num_friend_requests > 0 ? 
                    <Tab icon={<Badge badgeContent={num_friend_requests} color="secondary"><GroupIcon /></Badge>} aria-label="admin" label="My Products"  style={{padding: 0,fontSize: 12, textTransform: "none"}} />
                    :
                    <Tab icon={<GroupIcon />} aria-label="admin" label="My Products"  style={{padding: 0,fontSize: 12, textTransform: "none"}} />
                }

            </Tabs>
        </AppBar>

    );
}

export default IconTabs;
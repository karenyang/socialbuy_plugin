import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import SearchIcon from '@material-ui/icons/Search';
import WhatshotIcon from '@material-ui/icons/Whatshot';
import GroupIcon from '@material-ui/icons/Group';

const useStyles = makeStyles({
    root: {
        flexGrow: 1,
        maxWidth: 500,
        top: 'auto',
        bottom: 0,
    },
});


const IconTabs = ({ handleTabChange, tab }) => {
    console.log("TAB value: ", tab)
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
                aria-label="icon tabs example"
            >
                <Tab icon={<WhatshotIcon />} aria-label="popular" />
                <Tab icon={<SearchIcon />} aria-label="search" />
                <Tab icon={<GroupIcon />} aria-label="admin" />
            </Tabs>
        </AppBar>

    );
}

export default IconTabs;
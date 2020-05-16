
import {main} from './convert'
const tweets = require("../backup/data/tweet");

tweets ? main('json', tweets) : console.log("cannot find tweets data");

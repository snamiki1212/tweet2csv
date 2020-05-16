
import {main} from './convert'
const tweets = require("../backup/data/tweet");

tweets ? main('csv', tweets) : console.log("cannot find tweets data");

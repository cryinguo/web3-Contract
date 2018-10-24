pragma solidity ^0.4.24;

contract Contract {
    mapping (string => string) paperHash;
 
    function storagePaperHash(string paperName_, string paperHash_) public {
        paperHash[paperName_] = paperHash_;
    }

    function getPaperHash(string paperName_) public view returns (string) {
        return paperHash[paperName_];
    }
}
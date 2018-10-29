pragma solidity ^0.4.24;

contract Contract {

    struct Paper {
        string owner;
        string paperName;
        string paperHash;
    }

    //map: paperName to a paper instance
    mapping (string => Paper)  paperInfo;

    //compare diff types of str
    function stringsEqual(string storage _a, string memory _b)  internal view returns (bool) {

        bytes storage a = bytes(_a);
        bytes memory b = bytes(_b);

        if (a.length != b.length)
            return false;
		// @todo unroll this loop
        for (uint i = 0; i < a.length; i ++) {
            if (a[i] != b[i])
                return false;
            return true;
        }
    }

    //set paperOwnership (based on unique username)
    function setPaperOwnership(string userName_, string paperName_, string paperHash_) public {

        //paperName and hash must fresh
        require(!stringsEqual(paperInfo[paperName_].paperName, paperName_) && 
            !stringsEqual(paperInfo[paperName_].paperHash, paperHash_), "one paper one upload");

        paperInfo[paperName_] = Paper({
            owner: userName_,
            paperName: paperName_,
            paperHash: paperHash_
        });
    }

    //get filehash by filename  (cause return a struct is not supported)
    function getPaperHash(string paperName_) public view returns (string) {
        return paperInfo[paperName_].paperHash;
    }


    //display a paper's ownerShip
    function getOwner(string paperName_) public view returns (string) {
        return  paperInfo[paperName_].owner;
    }

}
pragma solidity ^0.4.24;

/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Ownable {
    address public owner;

    /**
      * @dev The Ownable constructor sets the original `owner` of the contract to the sender
      * account.
      */
    constructor() public {
        owner = msg.sender;
    }

    /**
      * @dev Throws if called by any account other than the owner.
      */
    modifier onlyOwner() {
        require(msg.sender == owner, "init owner");
        _;
    }

    /**
    * @dev Allows the current owner to transfer control of the contract to a newOwner.
    * @param newOwner The address to transfer ownership to.
    */
    function transferOwnership(address newOwner) public onlyOwner {
        if (newOwner != address(0)) {
            owner = newOwner;
        }
    }

}

/**
    paperID => 结构体{数组[marker(address,marks)] ,starttime}

 */

contract paperMarkingAlg is Ownable{
    using SafeMath for uint;
    struct Marker {
        address markerAddr;
        int mark;  // 这里我们假定分数是 < 100 的整数, 因为solidity不支持小数，所以我们后面会分数扩大
    }

    struct Paper {
        uint startTime;
        int markerNumer;    //无奈啊，makers.length 得到的值是 uint, 计算平均值和均方差都需要 int
        uint lastPeriodMarkerNum;   //记录上一期开奖的人数，方便下次开奖退钱给他们
        uint balance ; //每篇paper有自己的奖金池
        Marker[] markers;   
    }

    uint constant DAY_IN_SECONDS = 86400;
    uint awardPerid = 30 * DAY_IN_SECONDS;
    int decimals = 1e18; // 分数乘以 位数 来解决小数位问题
    address[] winner;

    //  paperID => paper{markers[marker1(address,marks), ...] ,startTime}
    // paperID 可以使用 paper hash
    mapping (uint => Paper) papers;

    /**
    * @dev setMark for a paper
    * @param _paperID The paper to setMark.
    * @param _mark The mark.
    */
    function setMark(uint _paperID, int _mark) public payable {
        require(msg.value == 50, "guarantee deposit before marking");

        if (papers[_paperID].markers.length == 0) {
            papers[_paperID].startTime = now;
        } 

        papers[_paperID].markers.push(Marker({     
            markerAddr: msg.sender,
            mark: _mark
        }));
        papers[_paperID].markerNumer += 1;
        papers[_paperID].balance.add(50);
    }

    /**
    * @dev award the honest person who set marks
    * @param _paperID The paper to give award.
    */
    // 因为不能再以太坊上无限循环，所以我们只能在外部写个脚本，每30天调用一次这个函数了？？？
    // 大概是这么实现的吧。
    function updateAward(uint _paperID) public onlyOwner{
        int fullMark = 0;  
        int meanMark = 0;
        int stdMark = 0;
        
        if (now >= papers[_paperID].startTime + (awardPerid)) {
            papers[_paperID].startTime = now;
            
            // 为了求平均而计算总分数
            for (uint i = 0; i < papers[_paperID].markers.length; i++){
                fullMark += papers[_paperID].markers[i].mark * (decimals); 
            }
            //得到的是近似值，因为存在除法截断; 存在问题 .length 是uint  *todo
            meanMark = fullMark / papers[_paperID].markerNumer;

            //求方差，因为不知道怎么开方
            for (uint j = 0; j < papers[_paperID].markers.length; j++){
                stdMark = (papers[_paperID].markers[j].mark * decimals - meanMark) * (
                    papers[_paperID].markers[j].mark * decimals - meanMark) / papers[_paperID].markerNumer;
            }

            //按照算法规则，把这些评分正常的人的钱退回去,计数从上一期开奖结束的人数开始
            for (uint k = papers[_paperID].lastPeriodMarkerNum; k < papers[_paperID].markers.length; k++){
                if (((papers[_paperID].markers[k].mark * decimals - meanMark) * (
                        papers[_paperID].markers[k].mark * decimals - meanMark) <= stdMark * 9) || ((
                            papers[_paperID].markers[k].mark * decimals - meanMark) * (
                                papers[_paperID].markers[k].mark * decimals - meanMark) >= stdMark * -9)) {
                    
                    papers[_paperID].lastPeriodMarkerNum = papers[_paperID].markers.length;    // 更新上一期参与人数
                    papers[_paperID].markers[k].markerAddr.transfer(50);
                    papers[_paperID].balance.sub(50);
                    winner.push(papers[_paperID].markers[k].markerAddr);

                }
            }

            //剩下的钱作为奖金再分出去一半，计数从0 开始，也就是越早参与的人获得奖励越多
            for (uint m = 0; m < winner.length; m++) {
                winner[m].transfer(papers[_paperID].balance.div(2).div(winner.length));
            }
        }
    }


}

/**
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */
library SafeMath {
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }
        uint256 c = a * b;
        assert(c / a == b);
        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        // assert(b > 0); // Solidity automatically throws when dividing by 0
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold
        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        assert(b <= a);
        return a - b;
    }

    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        assert(c >= a);
        return c;
    }
}
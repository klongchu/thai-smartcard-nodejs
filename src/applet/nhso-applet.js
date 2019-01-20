const { apduNhso } = require('../apdu')
const reader = require('../helper/reader');
const smartcard = require('smartcard');
const legacy = require('legacy-encoding');
const dayjs = require('dayjs');
const hex64 = require('hex64');
const CommandApdu = smartcard.CommandApdu;

class NhsoApplet {
  constructor(card, req = [0x00, 0xc0, 0x00, 0x00]) {
    this.card = card;
    this.req = req;
  }

  async getInfo() {
    const info = {};
    // check card
    await this.card.issueCommand(new CommandApdu(new CommandApdu({
      bytes: [...apduNhso.SELECT, ...apduNhso.NHSO_CARD]
    })));


    // main rights
    let data = await reader.getData(this.card, apduNhso.CMD_MAINRIGHTS, this.req);
    info.mainRights = legacy.decode(data, 'tis620').slice(0, -2).toString().trim();

    // sub rights
    data = await reader.getData(this.card, apduNhso.CMD_SUBRIGHTS, this.req);
    info.subRights = legacy.decode(data, 'tis620').slice(0, -2).toString().trim();

    // main hospital name
    data = await reader.getData(this.card, apduNhso.CMD_MAIN_HOSPITAL_NAME, this.req);
    info.mainHospitalName = legacy.decode(data, 'tis620').slice(0, -2).toString().trim();

    // sub hospital name
    data = await reader.getData(this.card, apduNhso.CMD_SUB_HOSPITAL_NAME, this.req);
    info.subHospitalName = legacy.decode(data, 'tis620').slice(0, -2).toString().trim();

    // paid type
    data = await reader.getData(this.card, apduNhso.CMD_PAID_TYPE, this.req);
    info.paidType = data.slice(0, -2).toString().trim();

    // Issue Date
    data = await reader.getData(this.card, apduNhso.CMD_ISSUE, this.req);
    data = data.slice(0, -2).toString().trim();
    info.issueDate = dayjs(`${+data.slice(0, 4) - 543}-${data.slice(4, 6)}-${data.slice(6)}`).format();

    // Expire Date
    data = await reader.getData(this.card, apduNhso.CMD_EXPIRE, this.req);
    data = data.slice(0, -2).toString().trim();
    console.log(data);
    info.expireDate = dayjs(`${+data.slice(0, 4) - 543}-${data.slice(4, 6)}-${data.slice(6)}`).format();

    // Update Date
    data = await reader.getData(this.card, apduNhso.CMD_UPDATE, this.req);
    data = data.slice(0, -2).toString().trim();
    info.updateDate = dayjs(`${+data.slice(0, 4) - 543}-${data.slice(4, 6)}-${data.slice(6)}`).format();

    // Change Hospital Amount
    data = await reader.getData(this.card, apduNhso.CMD_CHANGE_HOSPITAL_AMOUNT, this.req);
    info.changeHospitalAmount = data.slice(0, -2).toString().trim();

    return info;
  }
}

module.exports = NhsoApplet;
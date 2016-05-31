/*
* @Author: bjliujiajun
* @Date:   2016-05-27 17:05:14
* @Last Modified by:   bjliujiajun
* @Last Modified time: 2016-05-30 17:44:44
* 采用flux来完成非父子组件之间的通信
*/

'use strict';

/* store */
var Store = Object.assign({}, EventEmitter.prototype, {
  items: {
      'popLayerTitle': ''
  },

  getItem: function (key) {
      return this.items[key] || null;
  },

  setItem: function(){
      if(arguments.length === 2){
         this.items[arguments[0]] = arguments[1];
      }
      else if(arguments.length === 1){
         var src = arguments[0];
         if(typeof src !== 'object'){
            throw new Exception('参数格式错误')
         }
         for(var key in src){
            this.setItem(key, src[key]);
         }
      }
      else{
         throw new Exception('参数个数错误')
      }
  },

  emitShow: function () {
    this.emit('show');
  },

  addShowListener: function(callback) {
    this.on('show', callback);
  },

  removeShowListener: function(callback) {
    this.removeListener('show', callback);
  }
});

/* dispatcher */
var Dispatcher = new Flux.Dispatcher();
Dispatcher.register(function (action) {
  switch(action.actionType) {
    case 'SHOW_POPLAYER':
      Store.setItem({popLayerTitle: action.text});
      Store.emitShow();
      break;
    default:
      // no op
  }
});

/* action */
var Actions = {
  showPopLayer: function (text) {
    Dispatcher.dispatch({
      actionType: 'SHOW_POPLAYER',
      text: text
    });
  },
};

var CaptchaButton = React.createClass({
   getInitialState: function(){
      return {
         abled: true,
         sended: false,
         countDown: -1
      }
   },
   handleClick: function(){
      if(!this.state.abled){
         return;
      }
      if(!/^\d{11}$/.test(this.props.phoneNumber)){
         Actions.showPopLayer( '号码格式不正确' );
         return;
      }
      console.log('已向号码'+this.props.phoneNumber+'发送验证码');
      // 设置状态，禁止重复发送验证码，修改样式，设置倒计时事件
      this.setState({
         abled: false,
         sended: true,
         countDown: 5
      });
      // 开始倒计时
      var timeCount = setInterval(function(){
         if(this.state.countDown > 1){
            this.setState({ countDown: this.state.countDown - 1});
         }
         else{
            clearInterval(timeCount);
            this.setState({
               abled: true,
               sended: false,
               countDown: -1
            });
         }
      }.bind(this), 1000);
   },
   render: function(){
      var captchaClass = classNames({
         'send-Captcha': true,
         'disabled': this.state.sended
      });
      var text = '获取验证码';
      if(this.state.countDown != -1){
         text = '剩余' + this.state.countDown + '秒';
      }
      return (
            <button id="sendCaptcha1" className={captchaClass} type="button" onClick={this.handleClick}>{text}</button>
         );
   }
});
var SubmitButton = React.createClass({
   handleSubmit: function(){
      console.log('向后台发送程序');
      Actions.showPopLayer( '验证码错误' );
   },
   render: function(){
      if(this.props.isSubmitAble)
         return (
               <button className="form-submitBtn" type="submit" onClick={this.handleSubmit}>验证</button>
            );
      return (
            <button className="form-submitBtn" type="submit" disabled>验证</button>
         )
   }
});
var PopLayer = React.createClass({
   getInitialState: function(){
      return {
         isShow: false,
         message: ''
      };
   },
   showMessage: function(){
      if(!this.state.isShow){
         this.setState({
            isShow: true,
            message: Store.getItem('popLayerTitle')
         });
         setTimeout(function(){
            this.setState({
               isShow: false,
               message: ''
            });
         }.bind(this), 1000);
      }
   },
   componentDidMount: function(){
      //PubSub.subscribe('popMessage', this.showMessage);
      Store.addShowListener(this.showMessage);
   },
   componentWillUnmount: function(){
      //PubSub.subscribe('popMessage', this.showMessage);
      Store.removeShowListener(this.showMessage);
   },
   render: function(){
      // 不显示，返回空
      if(!this.state.isShow){
         return <div className="popLayer vertical-middle hidden"></div>;
      }
      return (
            <div className="popLayer vertical-middle">{this.state.message}</div>
         )
   }
});
var BindForm = React.createClass({
   getInitialState: function(){
      return {
         number: '',
         captcha: '',
         popLayershow: false
      };
   },
   handlePhoneInput: function(event){
      this.setState({
         number: event.target.value
      });
   },
   handleCapthcaInput: function(event){
      this.setState({
         captcha: event.target.value
      });
   },
   handleSubmit: function(event){
      event.preventDefault();
   },
   render: function(){
      var number = this.state.number;
      var captcha = this.state.captcha;
      var isSubmitAble = /^\d{11}$/.test(this.state.number) && this.state.captcha;
      return (
         <form id="phoneEdit" name="phoneEdit" className="form" onSubmit={this.handleSubmit}>
           <div className="input-container">
               <input type="tel" name="tel1" className="form-tel" placeholder="手机号" autocomplete="off" onChange={this.handlePhoneInput}/>
            </div>
            <div className="input-container">
               <input type="text" name="Captcha1" className="form-captcha" placeholder="验证码" onChange={this.handleCapthcaInput}/>
               <CaptchaButton phoneNumber={number}/>
            </div>
            <SubmitButton isSubmitAble={isSubmitAble}/>
            <PopLayer />
         </form>
         );
   }
});
ReactDOM.render( <BindForm />, document.getElementById('table'));

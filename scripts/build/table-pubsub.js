/*
* @Author: bjliujiajun
* @Date:   2016-05-27 17:05:14
* @Last Modified by:   bjliujiajun
* @Last Modified time: 2016-05-30 15:24:05
* 采用PubSub来完成非父子组件之间的通信
*/

'use strict';

var CaptchaButton = React.createClass({
   displayName: 'CaptchaButton',

   getInitialState: function getInitialState() {
      return {
         abled: true,
         sended: false,
         countDown: -1
      };
   },
   handleClick: function handleClick() {
      if (!this.state.abled) {
         return;
      }
      if (!/^\d{11}$/.test(this.props.phoneNumber)) {
         PubSub.publish('popMessage', { title: '号码格式不正确' });
         return;
      }
      console.log('已向号码' + this.props.phoneNumber + '发送验证码');
      // 设置状态，禁止重复发送验证码，修改样式，设置倒计时事件
      this.setState({
         abled: false,
         sended: true,
         countDown: 5
      });
      // 开始倒计时
      var timeCount = setInterval(function () {
         if (this.state.countDown > 1) {
            this.setState({ countDown: this.state.countDown - 1 });
         } else {
            clearInterval(timeCount);
            this.setState({
               abled: true,
               sended: false,
               countDown: -1
            });
         }
      }.bind(this), 1000);
   },
   render: function render() {
      var captchaClass = classNames({
         'send-Captcha': true,
         'disabled': this.state.sended
      });
      var text = '获取验证码';
      if (this.state.countDown != -1) {
         text = '剩余' + this.state.countDown + '秒';
      }
      return React.createElement(
         'button',
         { id: 'sendCaptcha1', className: captchaClass, type: 'button', onClick: this.handleClick },
         text
      );
   }
});
var SubmitButton = React.createClass({
   displayName: 'SubmitButton',

   handleSubmit: function handleSubmit() {
      console.log('向后台发送程序');
      PubSub.publish('popMessage', { title: '验证码错误' });
   },
   render: function render() {
      if (this.props.isSubmitAble) return React.createElement(
         'button',
         { className: 'form-submitBtn', type: 'submit', onClick: this.handleSubmit },
         '验证'
      );
      return React.createElement(
         'button',
         { className: 'form-submitBtn', type: 'submit', disabled: true },
         '验证'
      );
   }
});
var PopLayer = React.createClass({
   displayName: 'PopLayer',

   getInitialState: function getInitialState() {
      return {
         isShow: false,
         message: ''
      };
   },
   showMessage: function showMessage(event, data) {
      if (!this.state.isShow) {
         this.setState({
            isShow: true,
            message: data.title
         });
         setTimeout(function () {
            this.setState({
               isShow: false,
               message: ''
            });
         }.bind(this), 1000);
      }
   },
   componentDidMount: function componentDidMount() {
      PubSub.subscribe('popMessage', this.showMessage);
   },
   componentWillUnmount: function componentWillUnmount() {
      PubSub.subscribe('popMessage', this.showMessage);
   },
   render: function render() {
      // 不显示，返回空
      if (!this.state.isShow) {
         return React.createElement('div', { className: 'popLayer vertical-middle hidden' });
      }
      return React.createElement(
         'div',
         { className: 'popLayer vertical-middle' },
         this.state.message
      );
   }
});
var BindForm = React.createClass({
   displayName: 'BindForm',

   getInitialState: function getInitialState() {
      return {
         number: '',
         captcha: '',
         popLayershow: false
      };
   },
   handlePhoneInput: function handlePhoneInput(event) {
      this.setState({
         number: event.target.value
      });
   },
   handleCapthcaInput: function handleCapthcaInput(event) {
      this.setState({
         captcha: event.target.value
      });
   },
   handleSubmit: function handleSubmit(event) {
      event.preventDefault();
   },
   render: function render() {
      var number = this.state.number;
      var captcha = this.state.captcha;
      var isSubmitAble = /^\d{11}$/.test(this.state.number) && this.state.captcha;
      return React.createElement(
         'form',
         { id: 'phoneEdit', name: 'phoneEdit', className: 'form', onSubmit: this.handleSubmit },
         React.createElement(
            'div',
            { className: 'input-container' },
            React.createElement('input', { type: 'tel', name: 'tel1', className: 'form-tel', placeholder: '手机号', autocomplete: 'off', onChange: this.handlePhoneInput })
         ),
         React.createElement(
            'div',
            { className: 'input-container' },
            React.createElement('input', { type: 'text', name: 'Captcha1', className: 'form-captcha', placeholder: '验证码', onChange: this.handleCapthcaInput }),
            React.createElement(CaptchaButton, { phoneNumber: number })
         ),
         React.createElement(SubmitButton, { isSubmitAble: isSubmitAble }),
         React.createElement(PopLayer, null)
      );
   }
});
ReactDOM.render(React.createElement(BindForm, null), document.getElementById('table'));
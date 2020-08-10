const webpack = require('webpack');
const StringReplacePlugin = require("string-replace-webpack-plugin");

module.exports = {
    module: {
        rules: [
            {
                test: /\.ts$/,///api-config.interceptor.ts$/,
                use: {
                    loader: StringReplacePlugin.replace({
                        replacements: [
                            {
                                pattern: /<api-url>/,
                                replacement: function (match, p1, offset, string) {
                                    return "http://prodfinpalservices-staging.azurewebsites.net/";
                                }
                            },
                            {
                                pattern: /<app-url>/,
                                replacement: function(match, p1, offset, string) {
                                    return "http://finpalportal-staging.azurewebsites.net/";
                                }
                            },
                            {
                                pattern: /<cafex-script>/,
                                replacement: function (match, p1, offset, string) {
                                    return "(function(a){function b(){let e=JSON.parse(sessionStorage.getItem('chimeData')),f=e.bootstrapJs;c(f);let g=document.getElementById('chime-bootstrap');g||(g=document.createElement('script')),g.src=f,document.body.appendChild(g)}function c(e){let f=document.createElement('a');f.href=e;let g=f.hostname;return'liveassistfor365.com'===g.substr(g.length-'liveassistfor365.com'.length)}function d(e,f){let g=new XMLHttpRequest;g.open('DELETE',e+'/api/meeting/'+f),g.send()}window.lpTag=window.lpTag||{},'undefined'==typeof window.lpTag._tagCount?(window.lpTag={site:a,section:lpTag.section||'',autoStart:!1!==lpTag.autoStart,ovr:lpTag.ovr||{},_v:'1.6.0',_tagCount:1,protocol:'https:',events:{bind:function(e,f,g){lpTag.defer(function(){lpTag.events.bind(e,f,g)},0)},trigger:function(e,f,g){lpTag.defer(function(){lpTag.events.trigger(e,f,g)},1)}},defer:function(e,f){0==f?(this._defB=this._defB||[],this._defB.push(e)):1==f?(this._defT=this._defT||[],this._defT.push(e)):(this._defL=this._defL||[],this._defL.push(e))},load:function(e,f,g){var h=this;setTimeout(function(){h._load(e,f,g)},0)},_load:function(e,f,g){var h=e;e||(h=this.protocol+'//'+(this.ovr&&this.ovr.domain?this.ovr.domain:'lptag.liveperson.net')+'/tag/tag.js?site='+this.site);var j=document.createElement('script');j.setAttribute('charset',f?f:'UTF-8'),g&&j.setAttribute('id',g),j.setAttribute('src',h),document.getElementsByTagName('head').item(0).appendChild(j)},init:function(){this._timing=this._timing||{},this._timing.start=new Date().getTime();var e=this;window.attachEvent?window.attachEvent('onload',function(){e._domReady('domReady')}):(window.addEventListener('DOMContentLoaded',function(){e._domReady('contReady')},!1),window.addEventListener('load',function(){e._domReady('domReady')},!1)),'undefined'==typeof window._lptStop&&this.load()},start:function(){this.autoStart=!0},_domReady:function(e){this.isDom||(this.isDom=!0,this.events.trigger('LPT','DOM_READY',{t:e})),this._timing[e]=new Date().getTime()},vars:lpTag.vars||[],dbs:lpTag.dbs||[],ctn:lpTag.ctn||[],sdes:lpTag.sdes||[],ev:lpTag.ev||[]},lpTag.init()):window.lpTag._tagCount+=1,window.cafexAssistBootstrap={},window.cafexAssistBootstrap.laBootstrapLoaded=!1,window.cafexAssistBootstrap.cobrowseState,window.cafexAssistBootstrap.bootstrapLa=function(e){var f=document.getElementById('assist-cobrowse-bootstrap-script');f&&f.parentNode.removeChild(f);var h=document.createElement('script');h.id='assist-cobrowse-bootstrap-script',h.type='text/javascript',h.src=e+'/assist-bootstrap/assist-bootstrap.js',window.cafexAssistBootstrap.cobrowseBootstrapLoaded=function(){switch(window.cafexAssistBootstrap.laBootstrapLoaded=!0,window.cafexAssistBootstrap.cobrowseState){case'accepted':window.cafexAssistBootstrap.cobrowseAccepted(window.cafexAssistBootstrap.agentId);break;case'rejected':window.cafexAssistBootstrap.cobrowseRejected(window.cafexAssistBootstrap.agentId);}},document.head.appendChild(h)},sessionStorage.getItem('cobrowseServer')&&window.cafexAssistBootstrap.bootstrapLa(sessionStorage.getItem('cobrowseServer')),lpTag.events.bind({eventName:'cobrowseOffered',appName:'*',func:function(e){console.log(e),window.cafexAssistBootstrap.cobrowseState='offered';var f=document.querySelectorAll('[data-assist-a'+e.agentId+']'),g=JSON.parse(atob(f[f.length-1].dataset['assistA'+e.agentId]));console.log(g);var h=document.createElement('a');h.href=g.server;for(var j=['.cafex.com','.liveassistcloud.com','.liveassistfor365.com'],k=!1,l=h.hostname,m=0;m<j.length;m++){var o=j[m],p=l.indexOf(o);if(-1!=p||p==l.length-o.length){k=!0;break}}return k?void(sessionStorage.setItem('cobrowseServer',g.server),window.cafexAssistBootstrap.bootstrapLa(g.server)):void console.log('Unexpected cobrowse domain '+l+' aborting cobrowse.')},async:!0}),lpTag.events.bind({eventName:'cobrowseAccepted',appName:'*',func:function(e){console.log(e),window.cafexAssistBootstrap.cobrowseState='accepted',window.cafexAssistBootstrap.agentId=e.agentId,window.cafexAssistBootstrap.laBootstrapLoaded&&window.cafexAssistBootstrap.cobrowseAccepted(e.agentId)},async:!0}),lpTag.events.bind({eventName:'cobrowseDeclined',appName:'*',func:function(e){console.log(e),window.cafexAssistBootstrap.cobrowseState='rejected',window.cafexAssistBootstrap.agentId=e.agentId,window.cafexAssistBootstrap.laBootstrapLoaded&&window.cafexAssistBootstrap.cobrowseRejected(e.agentId)},async:!0}),lpTag.events.bind({eventName:'state',appName:'*',func:function(e){if('ended'==e.state&&removeChime(),'resume'==e.state){var f=sessionStorage.getItem('chimeData');f&&connectChime()}},async:!0}),document.addEventListener('click',function(e){if(e.target.dataset&&(void 0!==e.target.dataset.chimeAccept||void 0!==e.target.dataset.chimeReject)){let f=document.querySelectorAll('[data-chime]'),g=JSON.parse(atob(f[f.length-1].dataset.chime));meetingId=g.meetingId,chimeServer=g.server,audioOnly=g.audioOnly,guestId=g.guestId,bootstrapJs=g.bootstrapJs,c(bootstrapJs)?void 0===e.target.dataset.chimeAccept?void 0!==e.target.dataset.chimeReject&&d(chimeServer,meetingId):(sessionStorage.setItem('chimeData',JSON.stringify({meetingId:meetingId,guestId:guestId,chimeServer:chimeServer,audioOnly:audioOnly,bootstrapJs:bootstrapJs})),b()):console.log('Chime javascript domain unverified '+bootstrapJs+' aborting.')}})})('${accountNumber}');";
                                }
                            }
                        ]
                    })
                }
            } 
        ]
    },
    plugins: [
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false
        }),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            beautify: false,
            mangle: {
                screw_ie8: true,
                keep_fnames: true
            },
            compress: {
                screw_ie8: true
            },
            comments: false
        })
    ]
};
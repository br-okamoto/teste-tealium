var field_name;
var isSubmitting;
var hasError;
var hasModal;
var proposta_id;

function evalModal(){
    var m = window.document.getElementsByClassName('modal-dialog');
    if (m.length > 0){
        if (hasModal == false){
            hasModal = true;
            var t = m[0].getElementsByTagName('h2')[0].innerText;
            t = t.replace('error_outline', '(!) ');
            var l = m[0].getElementsByClassName('modal-wrapper')[0].innerText;
            if (l.length > 200)
                l = l.substr(0, 199) + '...';

            sendEvent('', String('Modal - ' + t), l);

            var b = m[0].getElementsByTagName('button');
            if (b.length > 0){
                for (var i = 0, L = b.length; i < L; i++){
                    b[i].onmousedown = function() {
                        var lbl = (this.value != undefined && this.value != null && this.value != '') ? this.value : this.innerText;
                        if (lbl.length < 2){
                            var t = this.parentNode.getElementsByTagName('h2')[0].innerText;
                            t = t.replace('error_outline', '(!) ');
                            lbl = 'FECHAR modal ' + t;
                        }
                        setTimeout(function(){hasModal = false;prepareToAddFormEvents();}, 500);
                        sendEvent('', 'Clicou', lbl);
                    }
                }
            }
        }
    } else {
        hasModal = false;
    }
}

function sendEvent(ctg, act, lbl){
    setTimeout(evalModal, 400);
    var _page = String(window.document.location.origin + window.document.location.pathname + window.document.location.hash);
    var tmp_ctg = String(ctg == '' ? _page : ctg);
    var hash = tmp_ctg.split('#');
    
    if (hash.length > 1){
        ctg = String(hash[0] + '#/');
        hash = String(hash[1]).split('/');
        for (var p in hash){
            if(isNaN(hash[p]))
                ctg += hash[p] + '/';
        }
    }else{
        ctg = tmp_ctg;
    }
    
    // correção de caracteres por causa da diferença de charset entre tealium e site
    lbl = String(lbl);
    try{
        lbl = decodeURI(escape(lbl));
    }catch(e){
        lbl = lbl;
    }
    lbl = lbl.replace('%24', '$');
    lbl = lbl.replace('%2C', ',');
    lbl = lbl.replace('%3F', '?');
    lbl = lbl.replace('%2B', '*');
    console.log(
        'eventCategory: ' + ctg,
        '\neventAction: ' + act,
        '\neventLabel: ' + lbl,
        '\nproposta_id: ' + proposta_id
    );
    tealium.track({
		'link', {
			event_category:ctg,
			event_action:act,
			event_label:lbl,
			proposta_id:proposta_id },
		'tealium'
    });
    //ga('send', 'event', ctg, act, lbl);
}
function evalField(elem){
    var v = false;// has value == foi preenchido
    var d = '';// checkbox | radiobutton | select selected option

    if (elem.nodeName == 'SPAN') {
        v = String(elem.innerText).length > 0 && String(elem.innerText) != 'Selecione';
    } else if (elem.type == 'radio'){
        v = elem.checked;
        d = ' ';
        var pn = elem;// this.parent
        while (d == ' '){
          pn = pn.parentNode;
          d += pn.innerText;
        }
    } else if (elem.type == 'checkbox'){
        v = elem.checked;
    } else if (elem.type == 'select-one' || elem.type == 'select-multiple') {
        v = elem.selectedIndex > 0 && String(elem.value).length > 0;
        d = ' ' + elem.options[elem.selectedIndex].text;
    } else {
        v = String(elem.value).length > 0 && String(elem.innerText) != 'Selecione';
    }
    //console.log(elem.id, v);

    var s;
    var p = elem.parentNode.getElementsByTagName('label');
    if (elem.type == 'radio' || elem.type == 'checkbox')
        p = elem.parentNode.parentNode.getElementsByTagName('label');
    if (p.length > 0){
        s = p[0].innerText;
    } else {
        p = elem.parentNode.parentNode.getElementsByTagName('label');
        if (p.length > 0){
            s = p[0].innerText;
        } else {
            if (elem.nodeName == 'SPAN') {
                s = elem.parentNode.parentNode.parentNode.getAttribute('data-label') || elem.parentNode.parentNode.parentNode.parentNode.getElementsByTagName('label')[0].innerText;
                //s += ' - ' + elem.innerText; /* value do option selecionado */
                if (elem.innerText == 'DEBITO EM CONTA SANTANDER'){
                    sendEvent('', 'Mostra form Dados Bancarios', s);
                    additionalFormEvents();
                }
            } else {
                s = elem.name;
                if (s == undefined || s == null || s.length == 0)
                    s = elem.id;
                if (s == undefined || s == null || s.length == 0)
                    s = elem.getAttribute('placeholder');
                if (s == 'Selecione')
                    s = 'Pesquisou ' + elem.parentNode.parentNode.getAttribute('data-label');
            }
        }
    }
    s = s.replace(' *', '');
    s = s.replace('* ', '');
    s = s.replace(' info', '');
    s = s.replace('content_', '');
    var a = s.split('$');
    s = a[a.length - 1];
    if (d.lastIndexOf(s) != -1){
        s = d.replace(' *', '');
        d = '';
    }
    if (s.lastIndexOf('?') == -1 && d.length > 0)
        s += ':';

    field_name = s + d;
    if (v)
        sendEvent('', 'Preencheu Campo', field_name);
    
    setTimeout(function(){ evalFieldError(elem); }, 200);
}
function evalFieldError(elem){
    // teste de erro de preenchimento
    var error = elem.parentNode.getElementsByClassName('msg-erro');
    if (error.length > 0)
        sendEvent('', 'Erro de Preenchimento', field_name);
}
function additionalFormEvents(){
    var c = []; // controls
    var f = window.document.getElementsByName('simulacao.formDadosBancarios');
    if (f.length > 0){
        c = c.concat(Array.prototype.slice.call(f[0].getElementsByTagName('input')));
    }
    for (var i = 0, L = c.length; i < L; i++){
        c[i].onchange = function(e) {
            evalField(this);
        };
    }
    
    setTimeout(evalModal, 400);
}
function prepareToAddFormEvents(){
    console.log('prepareToAddFormEvents()');
    setTimeout(evalModal, 400);
    clearInterval(tmp);
    var all_forms = window.document.getElementsByTagName('form');
    var the_form = all_forms[0];
    
    var c = []; // controls
        c = c.concat(Array.prototype.slice.call(window.document.getElementsByTagName('input')));
        c = c.concat(Array.prototype.slice.call(window.document.getElementsByTagName('select')));
        c = c.concat(Array.prototype.slice.call(window.document.getElementsByTagName('textarea')));
        c = c.concat(Array.prototype.slice.call(window.document.getElementsByTagName('a')));
        c = c.concat(Array.prototype.slice.call(window.document.getElementsByTagName('li')));
        c = c.concat(Array.prototype.slice.call(window.document.getElementsByTagName('button')));
        c = c.concat(Array.prototype.slice.call(window.document.getElementsByClassName('selectize-control')));
        c = c.concat(Array.prototype.slice.call(window.document.getElementsByClassName('btn-collapse-info')));
        c = c.concat(Array.prototype.slice.call(window.document.getElementsByClassName('noUi-base')));
        c = c.concat(Array.prototype.slice.call(window.document.querySelectorAll('div[class*="click-class"]')));
    
    for (var i = 0, L = c.length; i < L; i++){
        if (c[i].nodeName == 'DIV') {
            if ($(c[i]).hasClass('noUi-base')){
                console.log('slider ::: encontrado');
                c[i].onmouseup = function(evt){
                    var drg = this.getElementsByClassName('noUi-handle')[0];
                    var lbl = drg.getAttribute('data-hover');
                    sendEvent('', 'Alterado - Valor da Entrada', lbl);
                }
                c[i].onmousedown = function(evt){
                    var drg = this.getElementsByClassName('noUi-handle')[0];
                    var lbl = drg.getAttribute('data-hover');
                    sendEvent('', 'Alterado - Valor da Entrada', lbl);
                }
            } else if(c[i].getAttribute('click-class') != null) {
                c[i].onmouseup = function(evt){
                    if (this.getElementsByTagName('h2').length > 0){
                        var dir, lbl;
                        if (String(document.location).lastIndexOf('formalizacao') > -1) {
                            dir = ($(this.childNodes[1].childNodes[1]).hasClass('active') || $(this.childNodes[1].childNodes[2]).hasClass('active')) ? 'Oculta ' : 'Mostra ';
                            lbl = 'detalhes da proposta';
                        } else{
                            dir = $(this.childNodes[1]).hasClass('toogleActive') ? 'Oculta ' : 'Mostra ';
                            lbl = this.getElementsByTagName('h2')[0].innerText;
                        }
                        sendEvent('', 'Clicou', String(dir + lbl));
                    }
                };
            } else {
                c[i].onmouseup = function(evt){
                    var opt = this.getElementsByTagName('span')[0];
                    if (evt.target.innerText != opt.innerText)
                        setTimeout(function(){ evalField( opt ); }, 200);
                };
            }
        } else if (c[i].nodeName == 'A') {
            c[i].onmousedown = function() {
                var lbl = this.innerText;
                if (lbl.length == 0){
                    if ($(this).hasClass('logo')){
                        lbl = 'Logo Santander';
                    }
                } else {
                    lbl = lbl.replace('keyboard_arrow_left', '');
                    lbl = lbl.replace('keyboard_arrow_right', '');
                    lbl = lbl.replace('keyboard_arrow_up', '');
                    lbl = lbl.replace('keyboard_arrow_down', '');
                }
                sendEvent('', 'Clicou', lbl);
            }
        } else if (c[i].nodeName == 'LI') {
            c[i].onmousedown = function() {
                if ($(this).hasClass('hand')){
                    sendEvent('', 'Clicou', this.innerText);
                }
            }
        } else if (c[i].nodeName == 'BUTTON') {
            c[i].onmousedown = function() {
                if ($(this).hasClass('toogle-menu')){
                    sendEvent('', 'Clicou', 'Menu mobile');
                } else {
                    var lbl = (this.value != undefined && this.value != null && this.value != '') ? this.value : this.innerText;
                    if (lbl.length < 2)
                        lbl = 'FECHAR modal ' + this.parentNode.getElementsByTagName('h2')[0].innerText;
                    if (String(document.location).lastIndexOf('formalizacao') > -1 && (lbl.lastIndexOf('FOTO') > -1 || lbl.lastIndexOf('ARQUIVO') > -1))
                        lbl += ' - ' + this.parentNode.parentNode.parentNode.getElementsByTagName('strong')[0].innerText;
                    sendEvent('', 'Clicou', lbl);
                }
            }
        } else {
            if (c[i].type == 'submit'){
                c[i].onmousedown = function() {
                    sendEvent('', 'Clicou', String((this.value || this.innerText)));
                };
            } else if (c[i].nodeName == 'SPAN'){
                c[i].onmousedown = function() {
                    var lbl = this.innerText;//label
                    var lcl;//local
                    if (this.getAttribute('ng-click') != null){
                        lcl = String(this.getAttribute('ng-click').split('=')[0]);
                    } else {
                        lcl = String(this.childNodes[1].id);
                        lbl = String(this.childNodes[1].getAttribute('class'));
                    }
                    
                    var evt_lbl;
                    if (lbl.lastIndexOf('keyboard_arrow_down') > -1 && lcl.lastIndexOf('clientInfoActive') > -1)
                        evt_lbl = 'Mostra informações da simulação';
                    else if (lbl.lastIndexOf('keyboard_arrow_up') > -1 && lcl.lastIndexOf('clientInfoActive') > -1)
                        evt_lbl = 'Oculta informações da simulação';
                    else if (lbl.lastIndexOf('arrow-down') > -1 && lcl.lastIndexOf('arrowClientInfo') > -1)
                        evt_lbl = 'Mostra informações da simulação';
                    else if (lbl.lastIndexOf('arrow-up') > -1 && lcl.lastIndexOf('arrowClientInfo') > -1)
                        evt_lbl = 'Oculta informações da simulação';
                    else if (lbl.lastIndexOf('keyboard_arrow_down') > -1 && lcl.lastIndexOf('maisInformacoesFlag') > -1)
                        evt_lbl = 'Mostra outras informações';
                    else if (lbl.lastIndexOf('keyboard_arrow_up') > -1 && lcl.lastIndexOf('maisInformacoesFlag') > -1)
                        evt_lbl = 'Oculta outras informações';
                    else if (lbl.lastIndexOf('keyboard_arrow_down') > -1 && lcl.lastIndexOf('toggleSeguro') > -1)
                        evt_lbl = 'Mostra ' + this.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.getElementsByTagName('h1')[0].innerText + ': ' + this.parentNode.getElementsByTagName('label')[0].innerText;
                    else if (lbl.lastIndexOf('keyboard_arrow_up') > -1 && lcl.lastIndexOf('toggleSeguro') > -1)
                        evt_lbl = 'Oculta ' + this.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.getElementsByTagName('h1')[0].innerText + ': ' + this.parentNode.getElementsByTagName('label')[0].innerText;
                    else if (lbl.lastIndexOf('arrow-down') > -1 && lcl.lastIndexOf('arrowDadosPessoais') > -1)
                        evt_lbl = '';// 'Mostra form Informações Pessoais';
                    else if (lbl.lastIndexOf('arrow-up') > -1 && lcl.lastIndexOf('arrowDadosPessoais') > -1)
                        evt_lbl = '';// 'Oculta form Informações Pessoais';
                    else if (lbl.lastIndexOf('arrow-down') > -1 && lcl.lastIndexOf('arrowDadosResidenciais') > -1)
                        evt_lbl = 'Mostra form Informações Residenciais';
                    else if (lbl.lastIndexOf('arrow-up') > -1 && lcl.lastIndexOf('arrowDadosResidenciais') > -1)
                        evt_lbl = 'Oculta form Informações Residenciais';
                    else if (lbl.lastIndexOf('keyboard_arrow_down') > -1 && lcl.lastIndexOf('mostrarProposta') > -1)
                        evt_lbl = 'Mostra detalhes da proposta';
                    else if (lbl.lastIndexOf('keyboard_arrow_up') > -1 && lcl.lastIndexOf('mostrarProposta') > -1)
                        evt_lbl = 'Oculta detalhes da proposta';
                    else
                        if (String(document.location).lastIndexOf('painel/detalhes') > -1) {
                            var dir;
                            if(lbl.lastIndexOf('arrow-up'))
                                dir = 'Oculta ';
                            else
                                dir = 'Mostra ';
                            evt_lbl = '';// dir + this.parentNode.parentNode.getElementsByTagName('h2')[0].innerText;
                        } else if (String(document.location).lastIndexOf('formalizacao') > -1) {
                            var dir;
                            if(lbl.lastIndexOf('keyboard_arrow_down')){
                                dir = 'Oculta ';
                            }else{
                                dir = 'Mostra ';
                                setTimeout(prepareToAddFormEvents, 300);
                            }
                            evt_lbl = dir + this.parentNode.parentNode.parentNode.getElementsByTagName('h1')[0].innerText;
                        } else {
                            evt_lbl = lbl;
                        }
                    
                    if (evt_lbl != '')
                        sendEvent('', 'Clicou', evt_lbl);
                };
            } else {
                c[i].onchange = function(e) {
                    evalField(this);
                };
            }
        }
    }
    if (the_form != undefined && the_form != null) {
        the_form.onsubmit = function() {
            var error = window.document.getElementsByClassName('msg-erro');
            if (error.length == 0) {
                sendEvent('', 'Envio Form', 'Validado');
                isSubmitting = true;
                return true;
            }
        }
    }
    all_forms = undefined;

    window.removeEventListener('beforeunload', onWindowAbandoned);
    window.addEventListener('beforeunload', onWindowAbandoned);
}
function onWindowAbandoned() {
    console.log('beforeunload');
    if (!isSubmitting){
        field_name = (field_name == undefined || field_name.length == 0) ? '- Nenhum campo selecionado' : field_name;
        sendEvent('', 'Abandono Form', field_name);
    }
}

var count = 0;
var tmp;
function initEventsExtension(){
    var hash = String(window.location.hash.substring(1)).split('/');
    for (var p in hash){
        if(!isNaN(hash[p]))
            proposta_id = hash[p];
    }
    
    clearInterval(tmp);
    isSubmitting = false;
    hasError = false;
    hasModal = false;
    field_name = '';
    tmp = setInterval(function() {
        var ldr = window.document.getElementsByClassName('loading');
        var v = 0;// validate ::: all loadings has hidden
        if (ldr.length > 0){
            for (var j = 0, K = ldr.length; j < K; j++){
                var style = window.getComputedStyle(ldr[j]);
                if (style.display === 'none')
                    v++;
            }
        }
        //console.log('v =',v);
        var ngs = window.document.getElementsByClassName('ng-scope');
        for (var i = 0, L = ngs.length; i < L; i++){
            if (ngs[i].getAttribute('ng-view') != null){
                var chd = ngs[i].childElementCount;// validate ::: ng-view populated
                if (chd > 0 && v == ldr.length){
                    //console.log('initEventsExtension()');
                    clearInterval(tmp);
                    setTimeout(prepareToAddFormEvents, 400);
                    setTimeout(prepareToAddFormEvents, 5000);
                    break;
                }
            }
        }
        if (count > 30){
            clearInterval(tmp);
            count = 0;
            setTimeout(initEventsExtension, 1800);
        } else{
            count++;
        }
    }, 110);
}

window.onhashchange = function(){setTimeout(initEventsExtension, 500);};
setTimeout(initEventsExtension, 500);
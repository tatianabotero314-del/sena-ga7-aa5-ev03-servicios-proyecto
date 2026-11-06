"""Pruebas HTTP del proyecto contra Spring Boot real; solo usa datos ficticios."""
import http.cookiejar, json, os, time, urllib.request, urllib.parse, urllib.error
from pathlib import Path
BASE=os.environ.get('API_BASE','http://127.0.0.1:8081')
results=[]
class Cliente:
    def __init__(self):
        self.http=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
    def pedir(self,method,path,expected,body=None,form=False,csrf=True,raw=False):
        headers={}
        if method in ('POST','PUT','PATCH') and csrf:
            token=self.pedir('GET','/api/auth/csrf',200)
            headers[token['headerName']]=token['token']
        data=None
        if body is not None:
            headers['Content-Type']='application/x-www-form-urlencoded' if form else 'application/json'
            data=(body if raw else urllib.parse.urlencode(body) if form else json.dumps(body,ensure_ascii=False)).encode()
        request=urllib.request.Request(BASE+path,data=data,headers=headers,method=method)
        try:
            response=self.http.open(request)
        except urllib.error.HTTPError as error:
            response=error
        status=response.status; text=response.read().decode(); parsed=json.loads(text) if text else None
        # No se registran cookies, contraseñas ni tokens de sesión en los reportes.
        shown={'token':'[omitido]','headerName':parsed['headerName']} if path=='/api/auth/csrf' and status==200 else parsed
        results.append({'metodo':method,'ruta':path,'esperado':expected,'obtenido':status,'respuesta':shown})
        assert status==expected,(method,path,status,text)
        return parsed
    def login(self,correo):
        return self.pedir('POST','/api/auth/login',200,{'correo':correo,'password':'Practica2026!'},form=True)

try:
    a=Cliente()
    a.pedir('GET','/api/candidatos',401)
    a.pedir('POST','/api/auth/login',401,{'correo':'analista@demo.local','password':'Incorrecta2026!'},form=True)
    user=a.login('analista@demo.local');assert user['rol']=='Analista'
    assert 'password_hash' not in a.pedir('GET','/api/auth/me',200)
    vacantes=a.pedir('GET','/api/vacantes',200);assert len(vacantes)>=1
    data={'tipoDocumento':'CC','numeroDocumento':'EV03-'+str(time.time_ns())[-14:],'nombres':'Ana','apellidos':'Prueba','correo':'ana@example.com','telefono':'3001234567'}
    created=a.pedir('POST','/api/candidatos',201,data);cid=created['id'];assert created['nombres']=='Ana'
    a.pedir('POST','/api/candidatos',409,data)
    assert a.pedir('GET',f'/api/candidatos/{cid}',200)['id']==cid
    rows=a.pedir('GET','/api/candidatos?busqueda='+data['numeroDocumento'],200);assert len(rows)==1
    data['telefono']='3007654321'
    assert a.pedir('PUT',f'/api/candidatos/{cid}',200,data)['telefono']=='3007654321'
    a.pedir('POST','/api/candidatos',400,{**data,'correo':'no-es-correo'})
    a.pedir('POST','/api/candidatos',400,{**data,'nombres':'  '})
    a.pedir('POST','/api/candidatos',400,{**data,'rol':'ADMIN'})
    a.pedir('POST','/api/candidatos',400,'{',raw=True)
    a.pedir('GET','/api/candidatos/0',400)
    a.pedir('GET','/api/candidatos/no-numero',400)
    a.pedir('GET','/api/candidatos/99999999',404)
    a.pedir('GET','/api/candidatos?busqueda='+'a'*101,400)
    a.pedir('POST','/api/candidatos',403,data,csrf=False)
    a.pedir('POST','/api/postulaciones',400,{'idCandidato':0,'idVacante':1})
    a.pedir('POST','/api/postulaciones',404,{'idCandidato':99999999,'idVacante':1})
    post={'idCandidato':cid,'idVacante':vacantes[0]['id']}
    pid=a.pedir('POST','/api/postulaciones',201,post)['id']
    a.pedir('POST','/api/postulaciones',409,post)
    assert a.pedir('GET',f'/api/candidatos/{cid}/postulaciones',200)[0]['estado']=='En proceso'
    a.pedir('PATCH',f'/api/postulaciones/{pid}/estado',400,{'estado':'Contratado','observacion':'No permitido'})
    a.pedir('PATCH',f'/api/postulaciones/{pid}/estado',400,{'estado':'Seleccionado','observacion':' '})
    change={'estado':'Seleccionado','observacion':'Entrevista aprobada en práctica ficticia.'}
    a.pedir('PATCH',f'/api/postulaciones/{pid}/estado',204,change)
    a.pedir('PATCH',f'/api/postulaciones/{pid}/estado',409,change)
    history=a.pedir('GET',f'/api/postulaciones/{pid}/historial',200)
    assert len(history)==2 and history[1]['estado']=='Seleccionado' and history[1]['responsable']=='Analista de práctica'
    coordinator=Cliente();coordinator.login('coordinador@demo.local')
    coordinator.pedir('GET','/api/candidatos',200)
    coordinator.pedir('POST','/api/candidatos',403,data)
    a.pedir('POST','/api/auth/logout',204)
    a.pedir('GET','/api/auth/me',401)
    print('Correcto:',len(results),'solicitudes HTTP verificadas, incluidos intercambios CSRF.')
finally:
    Path('resultados').mkdir(exist_ok=True)
    Path('resultados/http.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))

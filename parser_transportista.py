import re
import sqlite3

file1 = open('filas_compradores.txt', 'r')
Lines = file1.readlines()
f = open('salida.txt', 'w', encoding='ANSI')
f_malos = open('salida_malos.txt', 'w', encoding='ANSI')


conn = sqlite3.connect('database.sqlite')

transportistas = []
camiones = []
id_transportista = -1
transport_cuits = []

for line in Lines:
  line = line.rstrip("\n")
  line = line.replace("\t", " ")
  release = line.split()
  print(release)

  if len(release) == 5:
    cuit = release[0] + release[1]
    chapa_chasis = release[2]
    chapa_acoplado = release[3]
    ingresos_brutos = release[4]

    chapa_chasis = chapa_chasis.replace(".", "")
    chapa_acoplado = chapa_acoplado.replace(".", "")
    ingresos_brutos = re.sub(r'^[.]+', '', ingresos_brutos)
    cuit = cuit.strip()

    print(cuit)
    print(chapa_chasis)
    print(chapa_acoplado)
    print(ingresos_brutos)

    if cuit not in transport_cuits:
      id_transportista += 1
      transport_cuits.append(cuit)
      transportista = [id_transportista, ingresos_brutos, cuit]
      print(transportista)
      transportistas.append(transportista)

    camion = [chapa_chasis, chapa_acoplado, id_transportista]
    camiones.append(camion)
    print(camion)

    # cur = conn.cursor()
    # cur.execute("SELECT idEstablecimiento FROM Establecimiento WHERE Nombre LIKE '" + establecimiento + "' and "
    #             "Partida = " + partida + " and Repagro = " + repagro + ";")
    # rows = cur.fetchall()
    # if rows:
    #   establecimiento = str(rows[0][0])
    # if not establecimiento:
    #   establecimiento = 'NULL'
    #
    # salida = "INSERT INTO Productor (RENSPA, BoletoMarca, BoletoSenial, IngresosBrutos, idEstablecimiento, CUITPersona) VALUES ('"
    # salida += respa + "', '"
    # salida += boleto_marca + "', '"
    # salida += boleto_senial + "', '"
    # salida += ingresos_brutos + "', "
    # salida += establecimiento + ", "
    # salida += cuit + ");\n"
    # print(salida)
    # f.write(salida)

  else:
    f_malos.write(line + '\n')

# print(transportistas)
# print('\n')
# print(camiones)

for transportista in transportistas:
  salida = "INSERT INTO Transportista (idTransportista, IngresosBrutos, CUITPersona) VALUES ("
  salida += str(transportista[0]) + ", '"
  salida += transportista[1] + "', "
  salida += transportista[2] + ");\n"
  f.write(salida)

salida = "\n"
f.write(salida)

for camion in camiones:
  salida = "INSERT INTO Camion (Chofer, ChapaChasis, ChapaAcoplado, idTransportista) VALUES (NULL, '"
  salida += camion[0] + "', '"
  salida += camion[1] + "', "
  salida += str(camion[2]) + ");\n"
  f.write(salida)

f.close()
f_malos.close()

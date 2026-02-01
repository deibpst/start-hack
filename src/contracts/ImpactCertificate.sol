// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ImpactCertificate
 * @dev Smart Contract para emitir certificados inmutables de ahorro de agua
 * @notice Este contrato recibe Pruebas de Impacto y emite certificados verificables
 * 
 * NOTA: Este contrato es de referencia para el MVP. En producción se desplegaría
 * en una red compatible con EVM (Ethereum, Polygon, etc.)
 */
contract ImpactCertificate {
    
    // Estructura para almacenar una Prueba de Impacto verificada
    struct Certificado {
        string productoId;
        string fabricaId;
        uint256 timestamp;
        uint256 ahorroAguaLitros;
        uint256 co2eEvitadoGramos; // En gramos para evitar decimales
        string regionSequia;
        int256 spiAlMomento; // SPI puede ser negativo, multiplicado por 100
        bytes32 hashPrueba;
        bool valido;
    }
    
    // Mapping de certificados por hash de prueba
    mapping(bytes32 => Certificado) public certificados;
    
    // Array de todos los hashes para iterar
    bytes32[] public listaCertificados;
    
    // Mapping de productos a sus certificados
    mapping(string => bytes32[]) public certificadosPorProducto;
    
    // Dirección del verificador autorizado (en producción sería multisig)
    address public verificadorAutorizado;
    
    // Eventos
    event CertificadoEmitido(
        bytes32 indexed hashPrueba,
        string productoId,
        string fabricaId,
        uint256 ahorroAguaLitros,
        uint256 timestamp
    );
    
    event CertificadoRevocado(
        bytes32 indexed hashPrueba,
        string motivo
    );
    
    // Modificadores
    modifier soloVerificador() {
        require(msg.sender == verificadorAutorizado, "Solo el verificador puede ejecutar esta funcion");
        _;
    }
    
    constructor() {
        verificadorAutorizado = msg.sender;
    }
    
    /**
     * @dev Emite un nuevo certificado de impacto
     * @param _productoId ID del producto (código de barras)
     * @param _fabricaId ID de la fábrica
     * @param _ahorroAguaLitros Litros de agua ahorrados
     * @param _co2eEvitadoGramos CO2e evitado en gramos
     * @param _regionSequia Estado de sequía de la región
     * @param _spiAlMomento Índice SPI multiplicado por 100
     * @param _hashPrueba Hash de la prueba de impacto
     */
    function emitirCertificado(
        string memory _productoId,
        string memory _fabricaId,
        uint256 _ahorroAguaLitros,
        uint256 _co2eEvitadoGramos,
        string memory _regionSequia,
        int256 _spiAlMomento,
        bytes32 _hashPrueba
    ) external soloVerificador {
        require(certificados[_hashPrueba].timestamp == 0, "Certificado ya existe");
        require(_ahorroAguaLitros > 0, "Ahorro debe ser mayor a cero");
        
        Certificado memory nuevoCertificado = Certificado({
            productoId: _productoId,
            fabricaId: _fabricaId,
            timestamp: block.timestamp,
            ahorroAguaLitros: _ahorroAguaLitros,
            co2eEvitadoGramos: _co2eEvitadoGramos,
            regionSequia: _regionSequia,
            spiAlMomento: _spiAlMomento,
            hashPrueba: _hashPrueba,
            valido: true
        });
        
        certificados[_hashPrueba] = nuevoCertificado;
        listaCertificados.push(_hashPrueba);
        certificadosPorProducto[_productoId].push(_hashPrueba);
        
        emit CertificadoEmitido(
            _hashPrueba,
            _productoId,
            _fabricaId,
            _ahorroAguaLitros,
            block.timestamp
        );
    }
    
    /**
     * @dev Verifica si un certificado es válido
     * @param _hashPrueba Hash de la prueba a verificar
     * @return bool indicando si el certificado es válido
     */
    function verificarCertificado(bytes32 _hashPrueba) external view returns (bool) {
        return certificados[_hashPrueba].valido && certificados[_hashPrueba].timestamp > 0;
    }
    
    /**
     * @dev Obtiene los detalles de un certificado
     * @param _hashPrueba Hash de la prueba
     * @return Estructura Certificado completa
     */
    function obtenerCertificado(bytes32 _hashPrueba) external view returns (Certificado memory) {
        require(certificados[_hashPrueba].timestamp > 0, "Certificado no existe");
        return certificados[_hashPrueba];
    }
    
    /**
     * @dev Revoca un certificado (solo en casos de fraude detectado)
     * @param _hashPrueba Hash del certificado a revocar
     * @param _motivo Motivo de la revocación
     */
    function revocarCertificado(bytes32 _hashPrueba, string memory _motivo) external soloVerificador {
        require(certificados[_hashPrueba].timestamp > 0, "Certificado no existe");
        require(certificados[_hashPrueba].valido, "Certificado ya revocado");
        
        certificados[_hashPrueba].valido = false;
        
        emit CertificadoRevocado(_hashPrueba, _motivo);
    }
    
    /**
     * @dev Obtiene el total de certificados emitidos
     * @return Número total de certificados
     */
    function totalCertificados() external view returns (uint256) {
        return listaCertificados.length;
    }
    
    /**
     * @dev Obtiene todos los certificados de un producto
     * @param _productoId ID del producto
     * @return Array de hashes de certificados
     */
    function obtenerCertificadosProducto(string memory _productoId) external view returns (bytes32[] memory) {
        return certificadosPorProducto[_productoId];
    }
    
    /**
     * @dev Transfiere el rol de verificador (para upgrades de gobernanza)
     * @param _nuevoVerificador Nueva dirección autorizada
     */
    function transferirVerificador(address _nuevoVerificador) external soloVerificador {
        require(_nuevoVerificador != address(0), "Direccion invalida");
        verificadorAutorizado = _nuevoVerificador;
    }
}
package com.royalty.backend.config; // 설정 폴더와 동일하게 맞춤

import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import java.sql.*;

public class VectorTypeHandler extends BaseTypeHandler<float[]> {
    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, float[] parameter, JdbcType jdbcType) throws SQLException {
        // 자바 float 배열을 "[0.1, 0.2...]" 형태의 문자열로 바꿔서 DB에 전달
        StringBuilder sb = new StringBuilder("[");
        for (int j = 0; j < parameter.length; j++) {
            sb.append(parameter[j]).append(j == parameter.length - 1 ? "" : ",");
        }
        sb.append("]");
        ps.setObject(i, sb.toString());
    }

    @Override
    public float[] getNullableResult(ResultSet rs, String columnName) throws SQLException {
        return parseVector(rs.getString(columnName));
    }

    @Override
    public float[] getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        return parseVector(rs.getString(columnIndex));
    }

    @Override
    public float[] getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        return parseVector(cs.getString(columnIndex));
    }

    private float[] parseVector(String vectorStr) {
        if (vectorStr == null) return null;
        // DB에서 가져온 "[0.1, 0.2...]" 문자열을 다시 자바 float[]로 변환
        String[] parts = vectorStr.replace("[", "").replace("]", "").split(",");
        float[] result = new float[parts.length];
        for (int i = 0; i < parts.length; i++) {
            result[i] = Float.parseFloat(parts[i].trim());
        }
        return result;
    }
}